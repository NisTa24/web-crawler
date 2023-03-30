import axios from 'axios';
import { load } from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';

import { isValidUrl, getRecordObject } from './utils';

const BASE_URL = 'https://www.arzt-auskunft.de';
const URL = BASE_URL + '/pathologie';
const PATHALOGIST_DETAILS_URL = 'https://www.arzt-auskunft.de/arzt/';

async function getHTMLContent(url: string): Promise<string | undefined> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch {
    console.error(`Could not fetch from ${url}`);
  }
}

async function crawlWebsite(url: string) {
  const csvWriter = createObjectCsvWriter({
    path: './result/output.csv',
    header: [
      { id: 'name', title: 'name' },
      { id: 'speciality', title: 'speciality' },
      { id: 'streetAddress', title: 'streetAdress' },
      { id: 'postalCode', title: 'postalCode' },
      { id: 'addressLocality', title: 'addressLocality' },
      { id: 'phone', title: 'phone' },
      { id: 'pageUrl', title: 'pageUrl' },
      { id: 'externalLink', title: 'externalLink' }
    ],
  });

  const urlsToCrawl = [URL];
  const crawledUrls = new Set<string>();

  console.log("Crawling started")
  while (urlsToCrawl.length) {
    const pageUrl = urlsToCrawl.pop();

    if (!pageUrl || !isValidUrl(pageUrl)) continue;

    const htmlContent = await getHTMLContent(pageUrl);

    if (!htmlContent) continue;

    const $ = load(htmlContent);

    if (pageUrl.startsWith(PATHALOGIST_DETAILS_URL) && !crawledUrls.has(pageUrl)) {
      const record = getRecordObject($, pageUrl);

      await csvWriter.writeRecords([record]);
    }

    crawledUrls.add(pageUrl);

    // find all links on the page that belong to the same domain and contains registered pathologists details
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');

      if (href && href.startsWith(BASE_URL) && !crawledUrls.has(href)) {
        urlsToCrawl.push(href);
      }
    });
  }

  console.log("End");
}

crawlWebsite(BASE_URL);
