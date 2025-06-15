// scrape_vm_california_comprehensive.js
// ─────────────────────────────────────────────────
// 1) npm install axios cheerio
// 2) node scrape_vm_california_comprehensive.js
// ─────────────────────────────────────────────────

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');

const API_KEY     = 'D1NNNHDDTU9G2C46RZ7MIV5MMZ0BCWIJI1DVQFUKSGHZKHGM61W4ZN2P4SMTOF1GO5KF2JMNLO344QRH';
const LIST_BASE   = 'https://www.volunteermatch.org/search/orgs.jsp';
const PAGE_DELAY  = 2500;  // Respectful delay between requests
const MAX_PAGES   = 10;    // Scrape first 10 pages per county
const OUTPUT_FILE = 'california_volunteer_orgs_comprehensive.json';

// All 58 California counties
const CALIFORNIA_COUNTIES = [
  'Alameda County, CA',
  'Alpine County, CA',
  'Amador County, CA',
  'Butte County, CA',
  'Calaveras County, CA',
  'Colusa County, CA',
  'Contra Costa County, CA',
  'Del Norte County, CA',
  'El Dorado County, CA',
  'Fresno County, CA',
  'Glenn County, CA',
  'Humboldt County, CA',
  'Imperial County, CA',
  'Inyo County, CA',
  'Kern County, CA',
  'Kings County, CA',
  'Lake County, CA',
  'Lassen County, CA',
  'Los Angeles County, CA',
  'Madera County, CA',
  'Marin County, CA',
  'Mariposa County, CA',
  'Mendocino County, CA',
  'Merced County, CA',
  'Modoc County, CA',
  'Mono County, CA',
  'Monterey County, CA',
  'Napa County, CA',
  'Nevada County, CA',
  'Orange County, CA',
  'Placer County, CA',
  'Plumas County, CA',
  'Riverside County, CA',
  'Sacramento County, CA',
  'San Benito County, CA',
  'San Bernardino County, CA',
  'San Diego County, CA',
  'San Francisco County, CA',
  'San Joaquin County, CA',
  'San Luis Obispo County, CA',
  'San Mateo County, CA',
  'Santa Barbara County, CA',
  'Santa Clara County, CA',
  'Santa Cruz County, CA',
  'Shasta County, CA',
  'Sierra County, CA',
  'Siskiyou County, CA',
  'Solano County, CA',
  'Sonoma County, CA',
  'Stanislaus County, CA',
  'Sutter County, CA',
  'Tehama County, CA',
  'Trinity County, CA',
  'Tulare County, CA',
  'Tuolumne County, CA',
  'Ventura County, CA',
  'Yolo County, CA',
  'Yuba County, CA'
];

// Category mappings from the website
const CATEGORIES = {
  'animals': 'Animals',
  'arts': 'Arts & Culture', 
  'family': 'Children & Youth,Community', // Combined as requested
  'tech': 'Computers & Technology',
  'hospital': 'Health & Medicine',
  'seniors': 'Seniors',
  'education': 'Education & Literacy',
  'advocacy': 'Advocacy & Human Rights'
};

// Enhanced error handling and retry logic
async function fetchRendered(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${retries} - Fetching: ${url}`);
      
      const api = new URL('https://app.scrapingbee.com/api/v1/');
      api.searchParams.set('api_key', API_KEY);
      api.searchParams.set('url', url);
      api.searchParams.set('render_js', 'true');
      api.searchParams.set('wait', '4000');  // Wait for JS to load
      api.searchParams.set('screenshot', 'false');
      api.searchParams.set('block_ads', 'true');
      api.searchParams.set('premium_proxy', 'true'); // Use premium proxy for better success rate
      
      const resp = await axios.get(api.toString(), { 
        timeout: 120000,  // 2 minute timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (resp.status === 200 && resp.data) {
        console.log(`✅ Successfully fetched page (${resp.data.length} chars)`);
        return cheerio.load(resp.data);
      }
      
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, PAGE_DELAY * attempt));
    }
  }
}

// Enhanced organization parsing
function parseOrgs($) {
  const seen = new Set();
  const out  = [];

  console.log('🔍 Looking for organization links...');
  
  // Multiple selectors to catch different page layouts
  const selectors = [
    'a[href*="/search/org"]',
    'a[href*="org"]',
    '.searchResultItem a',
    '.org-name a',
    '.organization-link',
    'h3 a, h2 a, h4 a',
    '.result-title a',
    '.org-title a'
  ];

  selectors.forEach(selector => {
    $(selector).each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      
      if (!href) return;
      
      // More flexible URL matching for organization pages
      const isOrgLink = href.includes('org') && 
                       (href.includes('/search/') || href.startsWith('/search/org') || 
                        href.match(/org\d+/) || href.match(/\/org\//));
      
      if (!isOrgLink) return;
      if (seen.has(href)) return;
      seen.add(href);

      const name = cleanText($a.text());
      if (!name || name.length < 3) return;
      
      const fullUrl = href.startsWith('http') ? href : 'https://www.volunteermatch.org' + href;

      // Look for categories and description in various container structures
      const $container = $a.closest('li, .media-body, .searchResultItem, .result-item, div.row, .org-info, .search-result, .organization');
      let categories = [];
      let description = '';
      let location = '';
      
      if ($container.length) {
        // Try multiple category selectors
        const categorySelectors = [
          'ul.categories li',
          '.categories span',
          '.category-tag',
          '.tags span',
          '.cause-areas span',
          '.category',
          '.causes li'
        ];
        
        categorySelectors.forEach(catSelector => {
          if (categories.length === 0) {
            categories = $container
              .find(catSelector)
              .map((i, li) => cleanText($(li).text()))
              .get()
              .filter(cat => cat.length > 0);
          }
        });
        
        // Look for description/summary
        const descSelectors = [
          '.description',
          '.org-description',
          '.summary',
          '.excerpt',
          '.mission-summary',
          'p.description',
          '.org-summary'
        ];
        
        descSelectors.forEach(descSelector => {
          if (!description) {
            const desc = $container.find(descSelector).first().text().trim();
            if (desc && desc.length > 20 && desc.length < 500) {
              description = cleanText(desc);
            }
          }
        });

        // Look for location info
        const locationSelectors = ['.location', '.address', '.org-location'];
        locationSelectors.forEach(locSelector => {
          if (!location) {
            const loc = $container.find(locSelector).text().trim();
            if (loc) location = cleanText(loc);
          }
        });
      }

      out.push({ 
        name, 
        url: fullUrl, 
        categories: categories.slice(0, 5),
        description,
        location
      });
    });
  });

  console.log(`📋 Found ${out.length} organizations on this page`);
  return out;
}

function cleanText(text) {
  return text ? text.trim().replace(/\s+/g, ' ').replace(/[^\w\s-.,&()'"!?]/g, '') : '';
}

// Extract contact information from text
function extractContactInfo(text) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  return {
    emails: [...new Set(emails)], // Remove duplicates
    phones: [...new Set(phones)]
  };
}

// Function to get detailed organization information
async function getOrgDetails(orgUrl, orgName) {
  try {
    console.log(`  🔍 Fetching details for: ${orgName}`);
    const $ = await fetchRendered(orgUrl);
    
    let email = '';
    let emails = [];
    let phone = '';
    let phones = [];
    let address = '';
    let website = '';
    let fullDescription = '';
    let missionStatement = '';
    
    // Get all text content to search for contact info
    const pageText = $.text();
    const contactInfo = extractContactInfo(pageText);
    emails = contactInfo.emails;
    phones = contactInfo.phones;
    
    // Look for direct email links
    $('a[href^="mailto:"]').each((_, el) => {
      const emailAddr = $(el).attr('href').replace('mailto:', '');
      if (emailAddr && !emails.includes(emailAddr)) {
        emails.push(emailAddr);
      }
    });
    
    // Look for external website
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!website && href && !href.includes('volunteermatch.org') && !href.includes('facebook.com') && !href.includes('twitter.com')) {
        website = href;
      }
    });
    
    // Look for address with multiple selectors
    const addressSelectors = [
      '.address', 
      '.location', 
      '.contact-info', 
      '.org-address',
      '.contact-address',
      '[class*="address"]',
      '[class*="location"]'
    ];
    
    addressSelectors.forEach(selector => {
      if (!address) {
        $(selector).each((_, el) => {
          const addr = $(el).text().trim();
          if (addr && (addr.includes('CA') || addr.includes('California'))) {
            address = cleanText(addr);
            return false; // Break
          }
        });
      }
    });
    
    // Look for full description
    const descSelectors = [
      '.full-description', 
      '.about', 
      '.description',
      '.org-description',
      '.mission', 
      '.overview',
      '.summary',
      '[class*="description"]',
      '[class*="about"]'
    ];
    
    descSelectors.forEach(selector => {
      if (!fullDescription) {
        const desc = $(selector).text().trim();
        if (desc && desc.length > 50) {
          fullDescription = cleanText(desc.substring(0, 800) + (desc.length > 800 ? '...' : ''));
        }
      }
    });
    
    // Look specifically for mission statement
    const missionSelectors = [
      '.mission',
      '.mission-statement', 
      '.our-mission',
      '[class*="mission"]',
      'h2:contains("Mission") + p',
      'h3:contains("Mission") + p',
      'h2:contains("Our Mission") + p'
    ];
    
    missionSelectors.forEach(selector => {
      if (!missionStatement) {
        const mission = $(selector).text().trim();
        if (mission && mission.length > 30 && mission.length < 500) {
          missionStatement = cleanText(mission);
        }
      }
    });
    
    // If no description but have mission, use mission as description
    if (!fullDescription && missionStatement) {
      fullDescription = missionStatement;
    }
    
    return { 
      email: emails[0] || '', 
      emails: emails,
      phone: phones[0] || '', 
      phones: phones,
      address, 
      website, 
      fullDescription,
      missionStatement
    };
    
  } catch (error) {
    console.log(`    ⚠️  Could not fetch details for ${orgName}:`, error.message);
    return { 
      email: '', 
      emails: [], 
      phone: '', 
      phones: [], 
      address: '', 
      website: '', 
      fullDescription: '',
      missionStatement: ''
    };
  }
}

// Function to scrape organizations by county and category
async function scrapeByCountyAndCategory(county, categoryKey, categoryValue, maxPages = 10) {
  console.log(`\n🎯 Scraping ${county} - ${categoryValue}`);
  const allOrgs = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`\n📄 Processing page ${page}/${maxPages} for ${county} - ${categoryValue}`);
      
      const searchParams = new URLSearchParams({
        l: county,
        page: page.toString(),
        categoryIds: categoryKey // This might need adjustment based on actual site
      });
      
      let listUrl = `${LIST_BASE}?${searchParams.toString()}`;
      
      // Alternative URL format if categoryIds doesn't work
      if (categoryValue.includes(',')) {
        // For combined categories, try both
        const cats = categoryValue.split(',');
        listUrl = `${LIST_BASE}?l=${encodeURIComponent(county)}&page=${page}`;
      }
      
      console.log(`🔗 Fetching: ${listUrl}`);
      
      const $ = await fetchRendered(listUrl);
      
      // Check if we got a valid page
      if (!$.html() || $.html().length < 1000) {
        console.log(`⚠️  Page ${page} seems empty, might have reached the end`);
        break;
      }
      
      // Parse organizations from this page
      const pageOrgs = parseOrgs($);
      
      if (pageOrgs.length === 0) {
        console.log(`⚠️  No organizations found on page ${page}, stopping`);
        break;
      }
      
      // Get detailed information for each organization
      for (let i = 0; i < pageOrgs.length; i++) {
        const org = pageOrgs[i];
        console.log(`  📋 Processing org ${i + 1}/${pageOrgs.length}: ${org.name}`);
        
        const details = await getOrgDetails(org.url, org.name);
        
        // Extract county name from full county string
        const countyName = county.replace(' County, CA', '').trim();
        
        const detailedOrg = {
          title: org.name,
          description: details.fullDescription || org.description || details.missionStatement || '',
          mission_statement: details.missionStatement || '',
          website: details.website || '',
          volunteer_match_url: org.url,
          email: details.email || '',
          all_emails: details.emails,
          phone: details.phone || '',
          all_phones: details.phones,
          address: details.address || org.location || '',
          county: countyName,
          state: 'California',
          category: categoryValue,
          reference: org.categories.join(', ') || categoryValue,
          scraped_categories: org.categories,
          scraped_at: new Date().toISOString()
        };
        
        allOrgs.push(detailedOrg);
        
        // Respectful delay between detailed requests
        if (i < pageOrgs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, PAGE_DELAY));
        }
      }
      
      // Delay between pages
      if (page < maxPages) {
        console.log(`⏳ Waiting ${PAGE_DELAY}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, PAGE_DELAY));
      }
      
    } catch (error) {
      console.error(`❌ Error on page ${page} for ${county} - ${categoryValue}:`, error.message);
      // Continue with next page
      continue;
    }
  }
  
  return allOrgs;
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive California volunteer organization scraper...');
    console.log(`🏛️  Counties: ${CALIFORNIA_COUNTIES.length}`);
    console.log(`🎯 Categories: ${Object.keys(CATEGORIES).length}`);
    console.log(`📄 Max pages per county/category: ${MAX_PAGES}`);
    console.log(`📊 Total combinations: ${CALIFORNIA_COUNTIES.length * Object.keys(CATEGORIES).length}`);
    
    const allResults = {
      scraped_at: new Date().toISOString(),
      total_counties: CALIFORNIA_COUNTIES.length,
      counties: CALIFORNIA_COUNTIES,
      max_pages_per_combination: MAX_PAGES,
      categories_scraped: Object.values(CATEGORIES),
      organizations: []
    };
    
    let totalCombinations = 0;
    let completedCombinations = 0;
    
    // Scrape each county and category combination
    for (const county of CALIFORNIA_COUNTIES) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🏛️  Starting county: ${county}`);
      console.log(`${'='.repeat(80)}`);
      
      for (const [categoryKey, categoryValue] of Object.entries(CATEGORIES)) {
        totalCombinations++;
        
        console.log(`\n${'-'.repeat(50)}`);
        console.log(`🎯 Processing: ${county} - ${categoryValue}`);
        console.log(`📊 Progress: ${completedCombinations + 1}/${CALIFORNIA_COUNTIES.length * Object.keys(CATEGORIES).length}`);
        console.log(`${'-'.repeat(50)}`);
        
        try {
          const countyOrgs = await scrapeByCountyAndCategory(county, categoryKey, categoryValue, MAX_PAGES);
          allResults.organizations.push(...countyOrgs);
          
          console.log(`✅ Completed ${county} - ${categoryValue}: ${countyOrgs.length} organizations found`);
          
          // Save intermediate results periodically
          if (completedCombinations % 10 === 0) {
            console.log(`💾 Saving intermediate results...`);
            fs.writeFileSync(
              path.join(__dirname, `temp_california_progress.json`),
              JSON.stringify({
                ...allResults,
                total_organizations: allResults.organizations.length,
                completed_combinations: completedCombinations + 1
              }, null, 2)
            );
          }
          
        } catch (error) {
          console.error(`❌ Failed to scrape ${county} - ${categoryValue}:`, error.message);
          continue;
        }
        
        completedCombinations++;
        
        // Longer delay between combinations to be respectful
        console.log(`⏳ Waiting ${PAGE_DELAY}ms before next combination...`);
        await new Promise(resolve => setTimeout(resolve, PAGE_DELAY));
      }
      
      // Even longer delay between counties
      console.log(`⏳ Completed ${county}. Waiting ${PAGE_DELAY * 2}ms before next county...`);
      await new Promise(resolve => setTimeout(resolve, PAGE_DELAY * 2));
    }
    
    // Final summary
    allResults.total_organizations = allResults.organizations.length;
    allResults.organizations_by_county = {};
    allResults.organizations_by_category = {};
    
    // Group results by county
    CALIFORNIA_COUNTIES.forEach(county => {
      const countyName = county.replace(' County, CA', '').trim();
      allResults.organizations_by_county[countyName] = 
        allResults.organizations.filter(org => org.county === countyName).length;
    });
    
    // Group results by category
    Object.values(CATEGORIES).forEach(category => {
      allResults.organizations_by_category[category] = 
        allResults.organizations.filter(org => org.category === category).length;
    });
    
    // Save final results
    fs.writeFileSync(
      path.join(__dirname, OUTPUT_FILE),
      JSON.stringify(allResults, null, 2),
      'utf8'
    );
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('🎉 SCRAPING COMPLETE!');
    console.log(`📊 Total organizations scraped: ${allResults.total_organizations}`);
    console.log(`🏛️  Counties processed: ${CALIFORNIA_COUNTIES.length}`);
    console.log(`🎯 Categories processed: ${Object.keys(CATEGORIES).length}`);
    console.log(`📈 Organizations by top counties:`);
    
    // Show top 10 counties by organization count
    const topCounties = Object.entries(allResults.organizations_by_county)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    topCounties.forEach(([county, count]) => {
      console.log(`   ${county}: ${count}`);
    });
    
    console.log(`📈 Organizations by category:`);
    Object.entries(allResults.organizations_by_category).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    console.log(`📄 Results saved to: ${OUTPUT_FILE}`);
    console.log(`${'='.repeat(80)}`);
    
    // Clean up temp files
    const tempFile = 'temp_california_progress.json';
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
  } catch (error) {
    console.error('\n❌ Scraping failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the comprehensive scraper
main();