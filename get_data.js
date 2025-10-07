const fs = require('fs').promises;
const xml2js = require('xml2js');

// Configuration
const BASE_URL = 'https://mfinante.gov.ro/static/40/Mfp/nomenclatoare/nomLocalitati_';
const DATE_SUFFIX = '_07.10.2025.xml';
const OUTPUT_FILE = 'data.json';
const TOTAL_IDS = 40;
const counties = [
    {
        "id": 1,
        "name": "Alba"
    },
    {
        "id": 2,
        "name": "Arad"
    },
    {
        "id": 3,
        "name": "Argeş"
    },
    {
        "id": 4,
        "name": "Bacau"
    },
    {
        "id": 5,
        "name": "Bihor"
    },
    {
        "id": 6,
        "name": "Bistriţa-Năsăud"
    },
    {
        "id": 7,
        "name": "Botoşani"
    },
    {
        "id": 8,
        "name": "Braşov"
    },
    {
        "id": 9,
        "name": "Brăila"
    },
    {
        "id": 10,
        "name": "Buzau"
    },
    {
        "id": 11,
        "name": "Caraş-Severin"
    },
    {
        "id": 51,
        "name": "Călăraşi"
    },
    {
        "id": 12,
        "name": "Cluj"
    },
    {
        "id": 13,
        "name": "Constanţa"
    },
    {
        "id": 14,
        "name": "Covasna"
    },
    {
        "id": 15,
        "name": "Dâmboviţa"
    },
    {
        "id": 16,
        "name": "Dolj"
    },
    {
        "id": 17,
        "name": "Galaţi"
    },
    {
        "id": 52,
        "name": "Giurgiu"
    },
    {
        "id": 18,
        "name": "Gorj"
    },
    {
        "id": 19,
        "name": "Harghita"
    },
    {
        "id": 20,
        "name": "Hunedoara"
    },
    {
        "id": 21,
        "name": "Ialomiţa"
    },
    {
        "id": 22,
        "name": "Iaşi"
    },
    {
        "id": 23,
        "name": "Ilfov"
    },
    {
        "id": 24,
        "name": "Maramureş"
    },
    {
        "id": 25,
        "name": "Mehedinţi"
    },
    {
        "id": 26,
        "name": "Mureş"
    },
    {
        "id": 27,
        "name": "Neamţ"
    },
    {
        "id": 28,
        "name": "Olt"
    },
    {
        "id": 29,
        "name": "Prahova"
    },
    {
        "id": 30,
        "name": "Satu-Mare"
    },
    {
        "id": 31,
        "name": "Sălaj"
    },
    {
        "id": 32,
        "name": "Sibiu"
    },
    {
        "id": 33,
        "name": "Suceava"
    },
    {
        "id": 34,
        "name": "Teleorman"
    },
    {
        "id": 35,
        "name": "Timiş"
    },
    {
        "id": 36,
        "name": "Tulcea"
    },
    {
        "id": 37,
        "name": "Vaslui"
    },
    {
        "id": 38,
        "name": "Vâlcea"
    },
    {
        "id": 39,
        "name": "Vrancea"
    },
    {
        "id": 40,
        "name": "Bucureşti"
    },
    {
        "id": 41,
        "name": "Sector Special"
    }
];
// Function to fetch XML data from a URL
async function fetchXML(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

// Function to convert XML string to JSON
async function xmlToJson(xmlString) {
    const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        normalizeTags: true
    });

    try {
        return await parser.parseStringPromise(xmlString);
    } catch (error) {
        console.error('Error parsing XML:', error.message);
        return null;
    }
}

// Main function
async function main() {
    console.log('Starting to fetch XML files...');

    // Create array of URLs to fetch
    const urls = Array.from({ length: TOTAL_IDS }, (_, i) =>
        `${BASE_URL}${i + 1}${DATE_SUFFIX}`
    );

    // Fetch all XML files in parallel
    console.log(`Fetching ${urls.length} XML files in parallel...`);
    const xmlPromises = urls.map(url => fetchXML(url));
    const xmlResults = await Promise.all(xmlPromises);

    // Filter out failed requests and convert to JSON
    console.log('Converting XML to JSON...');
    const jsonPromises = xmlResults
        .filter(xml => xml !== null)
        .map(xml => xmlToJson(xml));

    const jsonResults = await Promise.all(jsonPromises);
    const validResults = jsonResults.filter(json => json !== null);

    console.log(`Successfully processed ${validResults.length} out of ${TOTAL_IDS} files`);


    // Merge all JSON data into a single array
    const mergedData = {
        localities: validResults.flatMap(result => result.nom_localitati.rand),
        totalFiles: validResults.length,
        counties: counties,
        fetchedAt: new Date().toISOString()
    };

    // Save to file
    console.log(`Saving merged data to ${OUTPUT_FILE}...`);
    await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(mergedData, null, 2),
        'utf8'
    );

    console.log(`✓ Successfully saved data to ${OUTPUT_FILE}`);
    console.log(`Total records: ${validResults.length}`);
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
