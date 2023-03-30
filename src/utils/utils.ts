import { CheerioAPI } from "cheerio";

interface Pathologist {
    name: string;
    speciality: string;
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    phone: string;
    pageUrl: string;
    externalLink: string;
}

export const isValidUrl = (url: string) => {
    if (!url) return false;
  
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    
    return urlRegex.test(url);
};

export const getRecordObject = ($: CheerioAPI, pageUrl: string): Pathologist => {
    const record = { 
        name: $('h1.fs2').text().trim().split('\n').join(''), 
        speciality: $("*[itemprop = 'medicalSpecialty']").text(), 
        streetAddress: $("*[itemprop = 'streetAddress']").text(), 
        postalCode: $("*[itemprop = 'postalCode']").text(),
        addressLocality: $("*[itemprop = 'addressLocality']").text(), 
        phone: $("*[itemprop = 'telephone']").children('a').attr('href') ?? '', 
        pageUrl, 
        externalLink: $("*[itemprop = 'url']").children("*[itemprop = 'url']").children('a').attr('href') ?? '',
    };

    return record;
}