export interface VillageInfo {
  nameHindi: string;
  nameEnglish: string;
  population: number;
}

export interface PanchayatInfo {
  name: string;
  villages: VillageInfo[];
}

export interface BlockHierarchy {
  blockName: string;
  panchayats: PanchayatInfo[];
}

export const CENSUS_HIERARCHY: BlockHierarchy[] = [
  {
    blockName: 'नारायणपुर',
    panchayats: [
      {
        name: 'खड़कागांव',
        villages: [
          { nameHindi: 'खड़कागांव', nameEnglish: 'Khadkagaon', population: 531 },
          { nameHindi: 'खैराभाट', nameEnglish: 'Khairabhat', population: 248 },
        ],
      },
      {
        name: 'केरलापाल',
        villages: [
          { nameHindi: 'केरलापाल', nameEnglish: 'Kerlapal', population: 1247 },
        ],
      },
      {
        name: 'बिंजली',
        villages: [
          { nameHindi: 'बिंजली', nameEnglish: 'Binjali', population: 1262 },
          { nameHindi: 'तेलसी', nameEnglish: 'Telsi', population: 266 },
        ],
      },
      {
        name: 'सुलेंगा (गु०)',
        villages: [
          { nameHindi: 'सुलेंगा', nameEnglish: 'Sulenga', population: 1087 },
          { nameHindi: 'गुरिया', nameEnglish: 'Guriya', population: 273 },
        ],
      },
      {
        name: 'करलखा',
        villages: [
          { nameHindi: 'करलखा', nameEnglish: 'Karlakha', population: 1101 },
          { nameHindi: 'कनेरा', nameEnglish: 'Kanera', population: 215 },
          { nameHindi: 'पातुरबेड़ा', nameEnglish: 'Paturbeda', population: 166 },
        ],
      },
      {
        name: 'एड़का',
        villages: [
          { nameHindi: 'एड़का', nameEnglish: 'Edka', population: 1256 },
          { nameHindi: 'ईरको', nameEnglish: 'Irko', population: 551 },
          { nameHindi: 'कानागांव', nameEnglish: 'Kanagaon', population: 366 },
        ],
      },
      {
        name: 'आमासरा',
        villages: [
          { nameHindi: 'आमासरा', nameEnglish: 'Aamasara', population: 500 },
          { nameHindi: 'पुंगारपाल', nameEnglish: 'Pungarpal', population: 116 },
          { nameHindi: 'खुड़पई', nameEnglish: 'Khurpai', population: 179 },
          { nameHindi: 'माहका', nameEnglish: 'Mahka', population: 239 },
        ],
      },
      {
        name: 'देवगांव',
        villages: [
          { nameHindi: 'देवगांव', nameEnglish: 'Devgaon', population: 954 },
          { nameHindi: 'तेरदूल', nameEnglish: 'Terdul', population: 453 },
        ],
      },
      {
        name: 'गरांजी',
        villages: [
          { nameHindi: 'गरांजी', nameEnglish: 'Garanji', population: 1108 },
        ],
      },
      {
        name: 'पालकी',
        villages: [
          { nameHindi: 'पालकी', nameEnglish: 'Palki', population: 821 },
          { nameHindi: 'पुसागांव', nameEnglish: 'Pusagaon', population: 266 },
        ],
      },
      {
        name: 'ब्रेहबेड़ा',
        villages: [
          { nameHindi: 'ब्रेहबेड़ा', nameEnglish: 'Brehbeda', population: 412 },
          { nameHindi: 'सरगीपाल', nameEnglish: 'Sargipal', population: 223 },
        ],
      },
      {
        name: 'सोनपुर',
        villages: [
          { nameHindi: 'सोनपुर', nameEnglish: 'Sonpur', population: 507 },
        ],
      },
      {
        name: 'गढ़बेंगाल',
        villages: [
          { nameHindi: 'गढ़बेंगाल', nameEnglish: 'Gadhbengal', population: 1725 },
          { nameHindi: 'कुम्हली', nameEnglish: 'Kumhali', population: 536 },
          { nameHindi: 'ब्रेहबेड़ा', nameEnglish: 'Brehbeda', population: 108 },
        ],
      },
      {
        name: 'नयानार',
        villages: [
          { nameHindi: 'नयानार', nameEnglish: 'Nayanar', population: 629 },
        ],
      },
      {
        name: 'रेमावण्ड',
        villages: [
          { nameHindi: 'रेमावण्ड', nameEnglish: 'Remawand', population: 569 },
          { nameHindi: 'गोहड़ा', nameEnglish: 'Gohda', population: 249 },
          { nameHindi: 'मालिंगनार', nameEnglish: 'Malingnar', population: 533 },
        ],
      },
      {
        name: 'कुढ़ारगांव',
        villages: [
          { nameHindi: 'कुढ़ारगांव', nameEnglish: 'Kudhargaon', population: 730 },
          { nameHindi: 'गुलूमकोडो', nameEnglish: 'Gulumkodo', population: 261 },
        ],
      },
      {
        name: 'टिमनार',
        villages: [
          { nameHindi: 'टिमनार', nameEnglish: 'Timnar', population: 840 },
        ],
      },
      {
        name: 'बाकुलवाही',
        villages: [
          { nameHindi: 'बाकुलवाही', nameEnglish: 'Bakulwahi', population: 1190 },
        ],
      },
      {
        name: 'बेलगांव',
        villages: [
          { nameHindi: 'बेलगांव', nameEnglish: 'Belgaon', population: 1103 },
        ],
      },
      {
        name: 'बागडोंगरी',
        villages: [
          { nameHindi: 'बागडोंगरी', nameEnglish: 'Bagdongari', population: 645 },
          { nameHindi: 'कोकोडी', nameEnglish: 'Kokodi', population: 256 },
        ],
      },
      {
        name: 'हलामीमुंजमेटा',
        villages: [
          { nameHindi: 'हलामीमुंजमेटा', nameEnglish: 'Halamimunjmeta', population: 332 },
          { nameHindi: 'मरकाबेड़ा', nameEnglish: 'Markabeda', population: 482 },
          { nameHindi: 'कापसी', nameEnglish: 'Kapsi', population: 557 },
        ],
      },
      {
        name: 'बागबेड़ा',
        villages: [
          { nameHindi: 'बागबेड़ा', nameEnglish: 'Bagbeda', population: 655 },
          { nameHindi: 'सिवनी', nameEnglish: 'Sivni', population: 509 },
        ],
      },
      {
        name: 'बेनूर',
        villages: [
          { nameHindi: 'बेनूर', nameEnglish: 'Benoor', population: 2134 },
          { nameHindi: 'भीरागांव', nameEnglish: 'Bhiragaon', population: 367 },
        ],
      },
      {
        name: 'भाटपाल',
        villages: [
          { nameHindi: 'भाटपाल', nameEnglish: 'Bhatpal', population: 1249 },
          { nameHindi: 'भुरवाल', nameEnglish: 'Bhurwal', population: 466 },
          { nameHindi: 'खरगांव', nameEnglish: 'Khargaon', population: 422 },
        ],
      },
      {
        name: 'मातला',
        villages: [
          { nameHindi: 'मातला', nameEnglish: 'Matla', population: 311 },
          { nameHindi: 'पानीगांव', nameEnglish: 'Panigaon', population: 229 },
          { nameHindi: 'सिरपुर', nameEnglish: 'Sirpur', population: 279 },
        ],
      },
      {
        name: 'फरसगांव',
        villages: [
          { nameHindi: 'फरसगांव', nameEnglish: 'Farasgaon', population: 670 },
          { nameHindi: 'मुण्डपाल', nameEnglish: 'Mundpal', population: 260 },
          { nameHindi: 'बेड़माकोट', nameEnglish: 'Bedmakot', population: 299 },
        ],
      },
      {
        name: 'बड़ेजम्हरी',
        villages: [
          { nameHindi: 'बड़ेजम्हरी', nameEnglish: 'Badejamhari', population: 604 },
          { nameHindi: 'कोचवाही', nameEnglish: 'Kochwahi', population: 616 },
        ],
      },
      {
        name: 'कुकड़ाझोर',
        villages: [
          { nameHindi: 'कुकड़ाझोर', nameEnglish: 'Kukdajhor', population: 1029 },
          { nameHindi: 'सीतापाल', nameEnglish: 'Sitapal', population: 236 },
        ],
      },
      {
        name: 'बोरण्ड',
        villages: [
          { nameHindi: 'बोरण्ड', nameEnglish: 'Borand', population: 973 },
          { nameHindi: 'गोटाजम्हरी', nameEnglish: 'Gotajamhari', population: 556 },
          { nameHindi: 'रेंगाबेड़ा', nameEnglish: 'Rengabeda', population: 141 },
        ],
      },
      {
        name: 'करमरी',
        villages: [
          { nameHindi: 'करमरी', nameEnglish: 'Karmari', population: 247 },
          { nameHindi: 'कोडोली', nameEnglish: 'Kodoli', population: 265 },
          { nameHindi: 'एकोड़ी', nameEnglish: 'Ekodi', population: 53 },
          { nameHindi: 'गुमियागाल', nameEnglish: 'Gumiyagal', population: 64 },
          { nameHindi: 'ताड़ोनार', nameEnglish: 'Tadonar', population: 118 },
          { nameHindi: 'परलभाट', nameEnglish: 'Paralbhat', population: 55 },
          { nameHindi: 'कुरूसनार', nameEnglish: 'Kurusnar', population: 75 },
          { nameHindi: 'हिक्कोनार', nameEnglish: 'Hikkonar', population: 54 },
          { nameHindi: 'तिरहुल', nameEnglish: 'Tirhul', population: 42 },
          { nameHindi: 'ढूठा', nameEnglish: 'Dhutha', population: 62 },
        ],
      },
      {
        name: 'कोलियारी',
        villages: [
          { nameHindi: 'कोलियारी', nameEnglish: 'Koliyari', population: 591 },
          { nameHindi: 'नेतानार', nameEnglish: 'Netanar', population: 638 },
        ],
      },
      {
        name: 'दण्डवन',
        villages: [
          { nameHindi: 'दण्डवन', nameEnglish: 'Dandwan', population: 413 },
          { nameHindi: 'बागझर', nameEnglish: 'Bagjhar', population: 573 },
        ],
      },
      {
        name: 'कोंगेरा',
        villages: [
          { nameHindi: 'कोंगेरा', nameEnglish: 'Kongera', population: 1037 },
          { nameHindi: 'झारा', nameEnglish: 'Jhara', population: 240 },
          { nameHindi: 'कोशलनार', nameEnglish: 'Koshalnar', population: 578 },
          { nameHindi: 'कोंदाहुर', nameEnglish: 'Kondahur', population: 126 },
        ],
      },
      {
        name: 'छिनारी',
        villages: [
          { nameHindi: 'छिनारी', nameEnglish: 'Chhinari', population: 730 },
          { nameHindi: 'आदपाल', nameEnglish: 'Aadpal', population: 352 },
          { nameHindi: 'छोटेफरसगांव', nameEnglish: 'Chhotefarasgaon', population: 243 },
        ],
      },
      {
        name: 'तोयनार',
        villages: [
          { nameHindi: 'तोयनार', nameEnglish: 'Toynar', population: 511 },
          { nameHindi: 'बांसपाल', nameEnglish: 'Banspal', population: 220 },
        ],
      },
      {
        name: 'महिमागवाड़ी',
        villages: [
          { nameHindi: 'महिमागवाड़ी', nameEnglish: 'Mahimagwadi', population: 2288 },
        ],
      },
      {
        name: 'धौड़ाई',
        villages: [
          { nameHindi: 'धौड़ाई', nameEnglish: 'Dhoudai', population: 1705 },
        ],
      },
      {
        name: 'पल्ली',
        villages: [
          { nameHindi: 'पल्ली', nameEnglish: 'Palli', population: 368 },
          { nameHindi: 'बोथा', nameEnglish: 'Botha', population: 558 },
          { nameHindi: 'दुड़मी', nameEnglish: 'Dudhmi', population: 298 },
        ],
      },
      {
        name: 'बड़गांव',
        villages: [
          { nameHindi: 'बड़गांव', nameEnglish: 'Badgaon', population: 1221 },
          { nameHindi: 'कुम्हारीबेड़ा', nameEnglish: 'Kumharibeda', population: 243 },
          { nameHindi: 'कनेरा', nameEnglish: 'Kanera', population: 362 },
        ],
      },
      {
        name: 'सुलेंगा (धौ०)',
        villages: [
          { nameHindi: 'सुलेंगा', nameEnglish: 'Sulenga', population: 881 },
          { nameHindi: 'कुम्हारीछोटा', nameEnglish: 'Kumharichhota', population: 239 },
          { nameHindi: 'मड़ागड़ा', nameEnglish: 'Madhagadha', population: 377 },
          { nameHindi: 'टिरकानार', nameEnglish: 'Tirkanar', population: 301 },
          { nameHindi: 'कोकपाड', nameEnglish: 'Kokpad', population: 223 },
        ],
      },
      {
        name: 'गौरदण्ड',
        villages: [
          { nameHindi: 'गौरदण्ड', nameEnglish: 'Gourdand', population: 413 },
          { nameHindi: 'उमरगांव', nameEnglish: 'Umargaon', population: 291 },
          { nameHindi: 'गुट्टापाल', nameEnglish: 'Guttapal', population: 173 },
          { nameHindi: 'चिहरा', nameEnglish: 'Chihra', population: 83 },
        ],
      },
      {
        name: 'छोटेडोंगर',
        villages: [
          { nameHindi: 'छोटेडोंगर', nameEnglish: 'Chhotedonger', population: 3817 },
        ],
      },
      {
        name: 'धनोरा',
        villages: [
          { nameHindi: 'धनोरा', nameEnglish: 'Dhanora', population: 375 },
          { nameHindi: 'हिकपुला', nameEnglish: 'Hikpula', population: 58 },
          { nameHindi: 'मड़मनार', nameEnglish: 'Madhamnar', population: 404 },
        ],
      },
      {
        name: 'कन्हारगांव',
        villages: [
          { nameHindi: 'कन्हारगांव', nameEnglish: 'Kanhargaon', population: 1084 },
        ],
      },
      {
        name: 'मढ़ोनार',
        villages: [
          { nameHindi: 'मढ़ोनार', nameEnglish: 'Madhonar', population: 320 },
          { nameHindi: 'कचोरा', nameEnglish: 'kachora', population: 114 },
          { nameHindi: 'कायाना', nameEnglish: 'Kayanar', population: 160 },
          { nameHindi: 'ब्रेहबेड़ा', nameEnglish: 'Brehbeda', population: 100 },
          { nameHindi: 'हितुलवाड़', nameEnglish: 'Hitulwadh', population: 221 },
          { nameHindi: 'होड़नार', nameEnglish: 'Hodhnar', population: 157 },
          { nameHindi: 'तोयामेटा', nameEnglish: 'Toyameta', population: 206 },
          { nameHindi: 'हुर्रवाही', nameEnglish: 'Hurrewahi', population: 10 },
        ],
      },
      {
        name: 'बोरावण्ड',
        villages: [
          { nameHindi: 'बोरावण्ड', nameEnglish: 'Borawand', population: 728 },
        ],
      },
      {
        name: 'राजपुर',
        villages: [
          { nameHindi: 'राजपुर', nameEnglish: 'Rajpur', population: 373 },
          { nameHindi: 'बेडमा', nameEnglish: 'Bedma', population: 142 },
          { nameHindi: 'हिंरगई', nameEnglish: 'Hirangai', population: 95 },
          { nameHindi: 'झारा', nameEnglish: 'Jhara', population: 276 },
          { nameHindi: 'ब्रेहबेड़ा', nameEnglish: 'Brehbeda', population: 89 },
        ],
      },
      {
        name: 'टेमरूगांव',
        villages: [
          { nameHindi: 'टेमरूगांव', nameEnglish: 'Temrugaon', population: 503 },
          { nameHindi: 'कोडहेर', nameEnglish: 'Kodher', population: 204 },
          { nameHindi: 'पदनार', nameEnglish: 'Padnar', population: 240 },
          { nameHindi: 'गरदापाल', nameEnglish: 'Gardapal', population: 275 },
        ],
      },
      {
        name: 'खोड़गांव',
        villages: [
          { nameHindi: 'खोड़गांव', nameEnglish: 'Khodgaon', population: 440 },
          { nameHindi: 'परलभाट', nameEnglish: 'Paralbhat', population: 180 },
          { nameHindi: 'सुपगांव', nameEnglish: 'Supgaon', population: 96 },
          { nameHindi: 'अंजरेल', nameEnglish: 'Anjrel', population: 158 },
        ],
      },
      {
        name: 'बोरपाल',
        villages: [
          { nameHindi: 'बोरपाल', nameEnglish: 'Borpal', population: 776 },
        ],
      },
      {
        name: 'भरण्डा',
        villages: [
          { nameHindi: 'भरण्डा', nameEnglish: 'Bharanda', population: 438 },
          { nameHindi: 'टेमरूगांव', nameEnglish: 'Temrugaon', population: 199 },
          { nameHindi: 'मरदेल', nameEnglish: 'Mardel', population: 279 },
        ],
      },
      {
        name: 'तुरठा',
        villages: [
          { nameHindi: 'तुरठा', nameEnglish: 'Turtha', population: 362 },
          { nameHindi: 'एडंगपाल', nameEnglish: 'Endangpal', population: 38 },
          { nameHindi: 'कलेपाल', nameEnglish: 'Kalepal', population: 182 },
          { nameHindi: 'कड़हागांव', nameEnglish: 'Kadhahgaon', population: 325 },
        ],
      },
      {
        name: 'नेलवाड़',
        villages: [
          { nameHindi: 'नेलवाड़', nameEnglish: 'Nelwad', population: 558 },
          { nameHindi: 'लालसुहनार', nameEnglish: 'Lalsuhnar', population: 206 },
          { nameHindi: 'छोटेसुहनार', nameEnglish: 'Chhotesuhnar', population: 226 },
          { nameHindi: 'कस्तुरवाड़', nameEnglish: 'Kasturwad', population: 91 },
        ],
      },
      {
        name: 'दुग्गाबेंगाल',
        villages: [
          { nameHindi: 'दुग्गाबेंगाल', nameEnglish: 'Duggabengal', population: 615 },
          { nameHindi: 'चिपरेल', nameEnglish: 'Chiprel', population: 475 },
        ],
      },
      {
        name: 'आमगांव',
        villages: [
          { nameHindi: 'आमगांव', nameEnglish: 'Aamgaon', population: 428 },
          { nameHindi: 'मांडोकी', nameEnglish: 'Mandoki', population: 272 },
          { nameHindi: 'मरसकोडो', nameEnglish: 'Maraskodo', population: 288 },
        ],
      },
      {
        name: 'कोरेण्डा',
        villages: [
          { nameHindi: 'कोरेण्डा', nameEnglish: 'Korenda', population: 897 },
        ],
      },
      {
        name: 'तारागांव',
        villages: [
          { nameHindi: 'तारागांव', nameEnglish: 'Taragaon', population: 1080 },
          { nameHindi: 'बड़कानार', nameEnglish: 'Badkanar', population: 27 },
        ],
      },
      {
        name: 'ताड़ोपाल',
        villages: [
          { nameHindi: 'ताड़ोपाल', nameEnglish: 'Tadopal', population: 491 },
          { nameHindi: 'खड़कागांव', nameEnglish: 'Khadkagaon', population: 543 },
        ],
      },
      {
        name: 'चांदागांव',
        villages: [
          { nameHindi: 'चांदागांव', nameEnglish: 'Chandagaon', population: 133 },
          { nameHindi: 'सोनापाल', nameEnglish: 'Sonapal', population: 645 },
        ],
      },
      {
        name: 'माहका',
        villages: [
          { nameHindi: 'माहका', nameEnglish: 'Mahaka', population: 818 },
        ],
      },
      {
        name: 'नाउमुंजमेटा',
        villages: [
          { nameHindi: 'नाउमुंजमेटा', nameEnglish: 'Naumunjmeta', population: 450 },
          { nameHindi: 'गरावंड', nameEnglish: 'Garawand', population: 279 },
        ],
      },
      {
        name: 'बावड़ी',
        villages: [
          { nameHindi: 'बावड़ी', nameEnglish: 'Bawdi', population: 419 },
          { nameHindi: 'गोंगला', nameEnglish: 'Gongla', population: 172 },
          { nameHindi: 'गोटाबेनूर', nameEnglish: 'Gotabenoor', population: 275 },
          { nameHindi: 'मलेचूर', nameEnglish: 'Malechur', population: 123 },
        ],
      },
      {
        name: 'खड़कागांव (ब)',
        villages: [
          { nameHindi: 'खड़कागांव', nameEnglish: 'Khadkagaon', population: 347 },
          { nameHindi: 'बोरगांव', nameEnglish: 'Borgaon', population: 315 },
        ],
      },
      {
        name: 'बम्हनी',
        villages: [
          { nameHindi: 'बम्हनी', nameEnglish: 'Bamhani', population: 637 },
          { nameHindi: 'मेटाडोंगरी', nameEnglish: 'Metadongari', population: 162 },
        ],
      },
      {
        name: 'आतरगांव',
        villages: [
          { nameHindi: 'आतरगांव', nameEnglish: 'Aatargaon', population: 776 },
          { nameHindi: 'परपा', nameEnglish: 'Parpa', population: 56 },
        ],
      },
      {
        name: 'चमेली',
        villages: [
          { nameHindi: 'चमेली', nameEnglish: 'Chameli', population: 315 },
          { nameHindi: 'रोहताड़', nameEnglish: 'Rohtad', population: 175 },
          { nameHindi: 'बहकेर', nameEnglish: 'Bahker', population: 156 },
          { nameHindi: 'तुरूसमेटा', nameEnglish: 'Turshmeta', population: 306 },
        ],
      },
      {
        name: 'रायनार',
        villages: [
          { nameHindi: 'रायनार', nameEnglish: 'Raynar', population: 570 },
          { nameHindi: 'टेकानार', nameEnglish: 'Tekanar', population: 376 },
          { nameHindi: 'झोरीगांव', nameEnglish: 'Jhorigaon', population: 120 },
        ],
      },
      {
        name: 'उड़िदगांव',
        villages: [
          { nameHindi: 'उडिदगांव', nameEnglish: 'Udidgaon', population: 636 },
          { nameHindi: 'कुलानार', nameEnglish: 'Kulanar', population: 474 },
        ],
      },
    ],
  },
  {
    blockName: 'ओरछा',
    panchayats: [
      {
        name: 'पांगुड़',
        villages: [
          { nameHindi: 'पांगुड़', nameEnglish: 'Pangud', population: 190 },
          { nameHindi: 'बेरानिरपी', nameEnglish: 'Beranirpi', population: 51 },
          { nameHindi: 'बयोनार', nameEnglish: 'Bayonar', population: 64 },
          { nameHindi: 'कोडोनार', nameEnglish: 'Kodonar', population: 138 },
          { nameHindi: 'बतोर (विरान)', nameEnglish: 'Bator(viran)', population: 0 },
          { nameHindi: 'मसपुर (विरान)', nameEnglish: 'Mashpur(viran)', population: 0 },
          { nameHindi: 'ब्रेहबेड़ा (विरान)', nameEnglish: 'Brehbeda(viran)', population: 0 },
          { nameHindi: 'गुडरापदर (विरान)', nameEnglish: 'Gudrapadar(viran)', population: 0 },
          { nameHindi: 'कुसनार उर्फ बेलमारी (विरान)', nameEnglish: 'Kusnar(viran)', population: 0 },
          { nameHindi: 'कोरसकोडो', nameEnglish: 'Koraskodo', population: 19 },
          { nameHindi: 'कोरमकोडो', nameEnglish: 'Koramkodo', population: 18 },
          { nameHindi: 'खोरपार', nameEnglish: 'Khorpar', population: 100 },
          { nameHindi: 'तोरनार (विरान)', nameEnglish: 'Tornar(viran)', population: 0 },
        ],
      },
      {
        name: 'आदनार',
        villages: [
          { nameHindi: 'आदनार', nameEnglish: 'Aadnar', population: 31 },
          { nameHindi: 'ताडोगुण्डा', nameEnglish: 'Tadogunda', population: 23 },
          { nameHindi: 'छोटेबडेकोट', nameEnglish: 'Chhotebadekot', population: 0 },
          { nameHindi: 'बडेबडेकोट', nameEnglish: 'Badebadekot', population: 12 },
          { nameHindi: 'मेंजे', nameEnglish: 'Menje', population: 151 },
          { nameHindi: 'मलमेटा', nameEnglish: 'Malmeta', population: 117 },
          { nameHindi: 'मसपी', nameEnglish: 'Maspi', population: 66 },
          { nameHindi: 'रावनादि', nameEnglish: 'Rawnadi', population: 5 },
          { nameHindi: 'मुरसुलनापा', nameEnglish: 'Mursulnapa', population: 39 },
          { nameHindi: 'बोदुम (विरान)', nameEnglish: 'Bodum(viran)', population: 0 },
          { nameHindi: 'हिरंगेनार', nameEnglish: 'Hirangenar', population: 9 },
          { nameHindi: 'आमोकल', nameEnglish: 'Aamokal', population: 12 },
        ],
      },
      {
        name: 'मुरनार',
        villages: [
          { nameHindi: 'मुरनार', nameEnglish: 'Murnar', population: 355 },
          { nameHindi: 'बेचा', nameEnglish: 'Becha', population: 175 },
          { nameHindi: 'सरगीपाल', nameEnglish: 'Sargipal', population: 137 },
          { nameHindi: 'गुरमजूर', nameEnglish: 'Gurmanjur', population: 10 },
          { nameHindi: 'हिकमेटा', nameEnglish: 'Hikmita', population: 48 },
          { nameHindi: 'गेंगला', nameEnglish: 'Gengla', population: 110 },
          { nameHindi: 'ठरपानार', nameEnglish: 'Tharpanar', population: 63 },
        ],
      },
      {
        name: 'गारपा',
        villages: [
          { nameHindi: 'गारपा', nameEnglish: 'Garpa', population: 237 },
          { nameHindi: 'मसपुर', nameEnglish: 'Maspur', population: 207 },
          { nameHindi: 'होरादि', nameEnglish: 'Horadi', population: 44 },
          { nameHindi: 'दरदढ़ (विरान)', nameEnglish: 'Dardadh(viran)', population: 0 },
          { nameHindi: 'रानीमरका', nameEnglish: 'Ranimarka', population: 0 },
          { nameHindi: 'पालेमेटा (विरान)', nameEnglish: 'Palemeta(viran)', population: 0 },
          { nameHindi: 'मुयानतोले (विरान)', nameEnglish: 'Muyantole(viran)', population: 0 },
          { nameHindi: 'तुमेरादि', nameEnglish: 'Tumeradi', population: 131 },
          { nameHindi: 'गुमचुर', nameEnglish: 'Gumchur', population: 37 },
        ],
      },
      {
        name: 'घमण्डी',
        villages: [
          { nameHindi: 'घमण्डी', nameEnglish: 'Ghamandi', population: 51 },
          { nameHindi: 'मुगबेंडा (विरान)', nameEnglish: 'Mugbeda(viran)', population: 0 },
          { nameHindi: 'जटवर', nameEnglish: 'Jatwar', population: 52 },
          { nameHindi: 'करकाबेड़ा', nameEnglish: 'karkabeda', population: 40 },
          { nameHindi: 'कोंगाली', nameEnglish: 'Kongali', population: 60 },
          { nameHindi: 'हिकोनार', nameEnglish: 'Hikonar', population: 34 },
          { nameHindi: 'वाड़ापेदा', nameEnglish: 'Wadapeda', population: 71 },
          { nameHindi: 'परियादि', nameEnglish: 'Pariyadi', population: 54 },
          { nameHindi: 'पालेमेटा उर्फ बालेबेड़ा', nameEnglish: 'Balebeda', population: 56 },
          { nameHindi: 'गोडेलमरका', nameEnglish: 'Godelmarka', population: 18 },
        ],
      },
      {
        name: 'कोटकामेटा',
        villages: [
          { nameHindi: 'कोहकामेटा', nameEnglish: 'Kohkameta', population: 842 },
          { nameHindi: 'गाडावाही', nameEnglish: 'Gadawahi', population: 63 },
          { nameHindi: 'कोडनार', nameEnglish: 'Kodnar', population: 194 },
        ],
      },
      {
        name: 'कंदाड़ी',
        villages: [
          { nameHindi: 'कंदाडी', nameEnglish: 'Kandadi', population: 270 },
          { nameHindi: 'कुरूषनार', nameEnglish: 'Kurushnar', population: 540 },
          { nameHindi: 'जिवलापदर', nameEnglish: 'Jiwlapadar', population: 76 },
          { nameHindi: 'गुमियाबेड़ा', nameEnglish: 'Gumiyabeda', population: 114 },
          { nameHindi: 'आलवर', nameEnglish: 'Aalwar', population: 79 },
          { nameHindi: 'घोडागांव', nameEnglish: 'Ghodagaon', population: 23 },
        ],
      },
      {
        name: 'झारावाही',
        villages: [
          { nameHindi: 'झारावाही', nameEnglish: 'Jharawahi', population: 349 },
          { nameHindi: 'ढूटाखार', nameEnglish: 'Dhutakhar', population: 223 },
          { nameHindi: 'हतलानार', nameEnglish: 'Hatlanar', population: 183 },
        ],
      },
      {
        name: 'नेड़नार',
        villages: [
          { nameHindi: 'नेडनार', nameEnglish: 'Nednar', population: 246 },
          { nameHindi: 'कोडकानार', nameEnglish: 'Kodkanar', population: 198 },
          { nameHindi: 'ताडोनार', nameEnglish: 'Tadonar', population: 97 },
          { nameHindi: 'ताड़नार उर्फ मरकाबेड़ा', nameEnglish: 'Markabeda', population: 234 },
          { nameHindi: 'कोटेनार', nameEnglish: 'Kotenar', population: 271 },
          { nameHindi: 'टचेली', nameEnglish: 'Tacheli', population: 38 },
          { nameHindi: 'आकाबेडा', nameEnglish: 'Aakabeda', population: 324 },
          { nameHindi: 'गुरदई उर्फ गुमियाबेड़ा', nameEnglish: 'Gumiyabeda', population: 127 },
        ],
      },
      {
        name: 'पदमकोट',
        villages: [
          { nameHindi: 'पदमकोट', nameEnglish: 'Padamkot', population: 137 },
          { nameHindi: 'कस्तुरमेटा', nameEnglish: 'Kasturmeta', population: 70 },
          { nameHindi: 'नेलांगूर', nameEnglish: 'Nelangur', population: 99 },
          { nameHindi: 'मेटाबेड़ा', nameEnglish: 'Metabeda', population: 163 },
          { nameHindi: 'तोयामेटा', nameEnglish: 'Toyameta', population: 101 },
          { nameHindi: 'उसेबेडा', nameEnglish: 'Usebeda', population: 114 },
          { nameHindi: 'मिचबेडा', nameEnglish: 'Michbeda', population: 28 },
          { nameHindi: 'दोड़में', nameEnglish: 'Dodme', population: 53 },
        ],
      },
      {
        name: 'कच्चापाल',
        villages: [
          { nameHindi: 'कच्चापाल', nameEnglish: 'Kacchapal', population: 236 },
          { nameHindi: 'तेके', nameEnglish: 'Teke', population: 156 },
          { nameHindi: 'मरकुड़', nameEnglish: 'Murkud', population: 26 },
          { nameHindi: 'कानागांव', nameEnglish: 'Kanagoan', population: 379 },
          { nameHindi: 'ईरकभट्टी', nameEnglish: 'Irakbhatti', population: 225 },
        ],
      },
      {
        name: 'कुतुल',
        villages: [
          { nameHindi: 'कुतुल', nameEnglish: 'Kutul', population: 599 },
          { nameHindi: 'कोडलियर', nameEnglish: 'Kodliyar', population: 229 },
          { nameHindi: 'गट्टाकाल', nameEnglish: 'Gattakal', population: 147 },
          { nameHindi: 'कोडनार', nameEnglish: 'Kodnar', population: 39 },
          { nameHindi: 'मोहदी', nameEnglish: 'Mohandi', population: 158 },
        ],
      },
      {
        name: 'गोमागाल',
        villages: [
          { nameHindi: 'गोमागाल', nameEnglish: 'Gomagal', population: 445 },
          { nameHindi: 'कोहकापार', nameEnglish: 'Kohkapar', population: 97 },
        ],
      },
      {
        name: 'ओरछापार',
        villages: [
          { nameHindi: 'ओरछापार', nameEnglish: 'Orchhapar', population: 3158 },
          { nameHindi: 'बडेटोण्डाबेड़ा', nameEnglish: 'Badetondabeda', population: 224 },
          { nameHindi: 'गदाडी', nameEnglish: 'Gadadhi', population: 366 },
        ],
      },
      {
        name: 'गुदाड़ी',
        villages: [
          { nameHindi: 'मरकाबेड़ा', nameEnglish: 'Markabeda', population: 38 },
          { nameHindi: 'जुवाड़ा', nameEnglish: 'Juwada', population: 503 },
          { nameHindi: 'जबगुण्डा', nameEnglish: 'Jabgunda', population: 186 },
          { nameHindi: 'कुमनार', nameEnglish: 'Kumnar', population: 52 },
        ],
      },
      {
        name: 'मुरूमवाड़ा',
        villages: [
          { nameHindi: 'मुरूमवाड़ा', nameEnglish: 'Murumwada', population: 281 },
          { nameHindi: 'गुडेकोट', nameEnglish: 'Gudekot', population: 81 },
          { nameHindi: 'दिवालूर', nameEnglish: 'Diwaloor', population: 84 },
          { nameHindi: 'रेकापाल', nameEnglish: 'Rekapal', population: 64 },
        ],
      },
      {
        name: 'लंका',
        villages: [
          { nameHindi: 'लंका', nameEnglish: 'Lanka', population: 285 },
          { nameHindi: 'डोडीमरका', nameEnglish: 'Dodimarka', population: 151 },
          { nameHindi: 'पदमेटा', nameEnglish: 'Padmeta', population: 171 },
          { nameHindi: 'करांगुल', nameEnglish: 'Karangul', population: 242 },
        ],
      },
      {
        name: 'पीडियाकोट',
        villages: [
          { nameHindi: 'पीडियाकोट', nameEnglish: 'Pidiyakot', population: 570 },
          { nameHindi: 'लेकवाड़ा', nameEnglish: 'Lekwada', population: 187 },
          { nameHindi: 'एडसमेटा', nameEnglish: 'Adsmeta', population: 374 },
          { nameHindi: 'टाहकावाड़ा', nameEnglish: 'Tahkawada', population: 183 },
          { nameHindi: 'बिल्लेर (विरान)', nameEnglish: 'Biller(viran)', population: 13 },
        ],
      },
      {
        name: 'डूंगा',
        villages: [
          { nameHindi: 'डूंगा', nameEnglish: 'Doonga', population: 972 },
          { nameHindi: 'घोट', nameEnglish: 'Ghot', population: 169 },
        ],
      },
      {
        name: 'आदेर',
        villages: [
          { nameHindi: 'आदेर', nameEnglish: 'Aader', population: 191 },
          { nameHindi: 'चलचेर', nameEnglish: 'Chalcher', population: 248 },
          { nameHindi: 'ओरछामेटा', nameEnglish: 'Orchhameta', population: 186 },
        ],
      },
      {
        name: 'कोडोली',
        villages: [
          { nameHindi: 'कोडोली', nameEnglish: 'Kodoli', population: 529 },
          { nameHindi: 'छोटेटोंडेबेड़ा', nameEnglish: 'Chhotetondebeda', population: 428 },
        ],
      },
      {
        name: 'थुलथुली',
        villages: [
          { nameHindi: 'थुलथुली', nameEnglish: 'Thulthuli', population: 236 },
          { nameHindi: 'मेहनार', nameEnglish: 'Mehnar', population: 223 },
          { nameHindi: 'मोडमवाड़ा', nameEnglish: 'Modamwada', population: 80 },
          { nameHindi: 'हितुल', nameEnglish: 'Hitul', population: 169 },
        ],
      },
      {
        name: 'पोचावाड़ा',
        villages: [
          { nameHindi: 'पोचावाड़ा', nameEnglish: 'Pochawada', population: 90 },
          { nameHindi: 'नेडूर', nameEnglish: 'Medur', population: 137 },
          { nameHindi: 'ताड़नार', nameEnglish: 'Tandar', population: 84 },
          { nameHindi: 'भटबेड़ा', nameEnglish: 'Bhatbeda', population: 89 },
          { nameHindi: 'रोताड़', nameEnglish: 'Rotad', population: 246 },
          { nameHindi: 'छुसेली', nameEnglish: 'Chhuseli', population: 13 },
          { nameHindi: 'कोरोवाया', nameEnglish: 'Korowaya', population: 70 },
          { nameHindi: 'रंगाबेडा', nameEnglish: 'Rengabeda', population: 83 },
          { nameHindi: 'वट्टेकाल', nameEnglish: 'Vattekal', population: 88 },
        ],
      },
      {
        name: 'हांदावाड़ा',
        villages: [
          { nameHindi: 'हांदावाड़ा', nameEnglish: 'Handawada', population: 568 },
          { nameHindi: 'हितावाड़ा', nameEnglish: 'Hitawada', population: 867 },
        ],
      },
      {
        name: 'मंडाली',
        villages: [
          { nameHindi: 'मंडाली', nameEnglish: 'Mandali', population: 182 },
          { nameHindi: 'रायनार उर्फ भटबेड़ा', nameEnglish: 'Raynar', population: 278 },
          { nameHindi: 'मकसोली', nameEnglish: 'Maksoli', population: 339 },
          { nameHindi: 'टासनार', nameEnglish: 'Tasnar', population: 254 },
          { nameHindi: 'कोसताड़ी', nameEnglish: 'Kostadi', population: 59 },
        ],
      },
      {
        name: 'कुंदला',
        villages: [
          { nameHindi: 'कुंदला', nameEnglish: 'Kundla', population: 465 },
          { nameHindi: 'बासिंग', nameEnglish: 'Basing', population: 233 },
          { nameHindi: 'मुरहापदर', nameEnglish: 'Murhapadar', population: 65 },
          { nameHindi: 'हरिमरका', nameEnglish: 'Harimarka', population: 43 },
          { nameHindi: 'आलनार', nameEnglish: 'Aalnar', population: 106 },
          { nameHindi: 'कुमनार', nameEnglish: 'Kumnar', population: 14 },
          { nameHindi: 'एहनार', nameEnglish: 'Ehnar', population: 157 },
          { nameHindi: 'ओरछाकोरई', nameEnglish: 'Orchhakorai', population: 38 },
          { nameHindi: 'गुनेर', nameEnglish: 'Guner', population: 16 },
        ],
      },
      {
        name: 'कलमानार',
        villages: [
          { nameHindi: 'कलमानार', nameEnglish: 'Kalmanar', population: 342 },
          { nameHindi: 'कटुलनार', nameEnglish: 'Katulnar', population: 117 },
          { nameHindi: 'करकानार', nameEnglish: 'Karkanar', population: 328 },
          { nameHindi: 'कंगाली', nameEnglish: 'Kangali', population: 35 },
          { nameHindi: 'ईदनार', nameEnglish: 'Idnar', population: 79 },
          { nameHindi: 'नेलनार', nameEnglish: 'Nelnar', population: 328 },
          { nameHindi: 'ईरपानार', nameEnglish: 'Irpanar', population: 21 },
        ],
      },
      {
        name: 'कोंगे',
        villages: [
          { nameHindi: 'कोंगे', nameEnglish: 'Konge', population: 213 },
          { nameHindi: 'छिन्दपुर', nameEnglish: 'Chhindpur', population: 29 },
          { nameHindi: 'बिनागुण्डा', nameEnglish: 'Binagunda', population: 110 },
          { nameHindi: 'हाचेकोटी', nameEnglish: 'Hachekoti', population: 24 },
          { nameHindi: 'झारावर', nameEnglish: 'Jharawar', population: 23 },
          { nameHindi: 'मुसपरसी', nameEnglish: 'Musparsi', population: 49 },
          { nameHindi: 'बला', nameEnglish: 'Bala', population: 81 },
          { nameHindi: 'मंगबेड़ा', nameEnglish: 'Mangbeda', population: 29 },
          { nameHindi: 'टेकामेटा', nameEnglish: 'Tekameta', population: 48 },
          { nameHindi: 'कोडहूर', nameEnglish: 'Kodhur', population: 27 },
          { nameHindi: 'काकहूर', nameEnglish: 'Kakhur', population: 22 },
          { nameHindi: 'कोडोनार', nameEnglish: 'Kodonar', population: 138 },
        ],
      },
      {
        name: 'मेटानार',
        villages: [
          { nameHindi: 'मेटानार', nameEnglish: 'Metanar', population: 82 },
          { nameHindi: 'वदेर', nameEnglish: 'Vader', population: 139 },
          { nameHindi: 'तुड़को', nameEnglish: 'Tudko', population: 73 },
          { nameHindi: 'ताड़ोबेड़ा', nameEnglish: 'Tadabeda', population: 61 },
          { nameHindi: 'ब्रेहबेडा', nameEnglish: 'Brehbeda', population: 120 },
          { nameHindi: 'ढोढरीबेड़ा', nameEnglish: 'Dhodhribeda', population: 50 },
          { nameHindi: 'पालरहुर', nameEnglish: 'Palarhur', population: 95 },
        ],
      },
      {
        name: 'कोडोली उर्फ कस्तुरमेटा',
        villages: [
          { nameHindi: 'कोडोली उर्फ कस्तुरमेटा', nameEnglish: 'Kasturmeta', population: 58 },
          { nameHindi: 'निरामेटा', nameEnglish: 'Nirameta', population: 218 },
          { nameHindi: 'हिकपाड़', nameEnglish: 'Hikpad', population: 153 },
          { nameHindi: 'ओकपाड', nameEnglish: 'Ookpad', population: 343 },
          { nameHindi: 'ताड़ोहूर', nameEnglish: 'Tadohur', population: 73 },
          { nameHindi: 'दुमनार', nameEnglish: 'Dumnar', population: 100 },
        ],
      },
      {
        name: 'धुरबेड़ा',
        villages: [
          { nameHindi: 'धुरबेड़ा', nameEnglish: 'Dhurbeda', population: 114 },
          { nameHindi: 'फरसबेड़ा', nameEnglish: 'Farasbeda', population: 133 },
          { nameHindi: 'कोडतामडका', nameEnglish: 'Kodtamdka', population: 54 },
          { nameHindi: 'आदिमपर', nameEnglish: 'Aadimpar', population: 74 },
          { nameHindi: 'माटवाड़ा', nameEnglish: 'Matwada', population: 163 },
          { nameHindi: 'गुमरका', nameEnglish: 'Gumarka', population: 221 },
        ],
      },
      {
        name: 'जाटलूर',
        villages: [
          { nameHindi: 'जाटलूर', nameEnglish: 'Jatlur', population: 355 },
          { nameHindi: 'बोटेर', nameEnglish: 'Botel', population: 108 },
          { nameHindi: 'हरबेल', nameEnglish: 'Harbel', population: 207 },
          { nameHindi: 'धोबे', nameEnglish: 'Dhobe', population: 173 },
          { nameHindi: 'गट्टाकाल', nameEnglish: 'Gattakal', population: 113 },
        ],
      },
      {
        name: 'हिकुल',
        villages: [
          { nameHindi: 'हिकुल', nameEnglish: 'Hikul', population: 169 },
          { nameHindi: 'परलनार', nameEnglish: 'Paralnar', population: 171 },
          { nameHindi: 'तोयनार', nameEnglish: 'Toyanar', population: 260 },
          { nameHindi: 'टाहकावाड़ा', nameEnglish: 'Tahkawada', population: 183 },
        ],
      },
      {
        name: 'गोमें',
        villages: [
          { nameHindi: 'गोमें', nameEnglish: 'Gome', population: 204 },
          { nameHindi: 'मरकाबेड़ा', nameEnglish: 'Markabeda', population: 33 },
          { nameHindi: 'बिरूलेर', nameEnglish: 'Biruler', population: 47 },
          { nameHindi: 'मुतेनादि', nameEnglish: 'Mutenadi', population: 31 },
          { nameHindi: 'मुतेनतोड़ा', nameEnglish: 'Mutentoda', population: 20 },
          { nameHindi: 'बोगान', nameEnglish: 'Bogan', population: 118 },
        ],
      },
      {
        name: 'ढोंढरबेड़ा',
        villages: [
          { nameHindi: 'ढोंढरबेड़ा', nameEnglish: 'Dhondarbeda', population: 191 },
          { nameHindi: 'कुडमेल', nameEnglish: 'Kudmel', population: 444 },
          { nameHindi: 'कोदाकोटी', nameEnglish: 'Kodakoti', population: 29 },
        ],
      },
      {
        name: 'रेकावाया',
        villages: [
          { nameHindi: 'रेकावाया', nameEnglish: 'Rekawaya', population: 510 },
          { nameHindi: 'कोम्हू', nameEnglish: 'Komhu', population: 55 },
          { nameHindi: 'कल्हाजा', nameEnglish: 'Kalhaja', population: 67 },
          { nameHindi: 'आलवाडा', nameEnglish: 'Aalwada', population: 88 },
        ],
      },
    ],
  },
];