// Fotos dos drinks via TheCocktailDB CDN.
// Append "/preview" na URL para thumbnail (150×150).
const drinkPhotos = {
  1:  'https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg', // Mojito
  2:  'https://www.thecocktaildb.com/images/media/drink/mrz9091589574515.jpg', // Daiquiri
  3:  'https://www.thecocktaildb.com/images/media/drink/reiwt31546439844.jpg', // Piña Colada
  4:  'https://www.thecocktaildb.com/images/media/drink/n3yjlq1504456456.jpg', // Cuba Libre
  5:  'https://www.thecocktaildb.com/images/media/drink/qgdu971561574065.jpg', // Negroni
  6:  'https://www.thecocktaildb.com/images/media/drink/3gltv21504366426.jpg', // Gin Tônica
  7:  'https://www.thecocktaildb.com/images/media/drink/hbkfsh1589574990.jpg', // Tom Collins
  8:  'https://www.thecocktaildb.com/images/media/drink/6kxb4s1504885734.jpg', // Martini
  9:  'https://www.thecocktaildb.com/images/media/drink/kpsajh1504368362.jpg', // Cosmopolitan
  10: 'https://www.thecocktaildb.com/images/media/drink/3pylxc1504370988.jpg', // Moscow Mule
  11: 'https://www.thecocktaildb.com/images/media/drink/t6syup1472668250.jpg', // Bloody Mary
  12: 'https://www.thecocktaildb.com/images/media/drink/wpxpvu1439905379.jpg', // Margarita
  13: 'https://www.thecocktaildb.com/images/media/drink/tqxyxx1472719737.jpg', // Tequila Sunrise
  14: 'https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg', // Old Fashioned
  15: 'https://www.thecocktaildb.com/images/media/drink/s4ym631504367485.jpg', // Whisky Sour
  16: 'https://www.thecocktaildb.com/images/media/drink/iytspv1606770357.jpg', // Aperol Spritz
  17: 'https://www.thecocktaildb.com/images/media/drink/ymfnt01504372471.jpg', // Caipirinha
  18: 'https://www.thecocktaildb.com/images/media/drink/reiwt31546439844.jpg', // Batida de Coco → Piña Colada
  19: 'https://www.thecocktaildb.com/images/media/drink/n0sx8t1596463963.jpg', // Espresso Martini
  20: 'https://www.thecocktaildb.com/images/media/drink/ymfnt01504372471.jpg', // Caipiroska → Caipirinha
  21: 'https://www.thecocktaildb.com/images/media/drink/3yvkbm1504366426.jpg', // Sex on the Beach
  22: 'https://www.thecocktaildb.com/images/media/drink/zomvzb1506545877.jpg', // Mai Tai
  23: 'https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg', // Piña Verde → Mojito
  24: 'https://www.thecocktaildb.com/images/media/drink/d3lcs01589574721.jpg', // Clericot → Mimosa
  25: 'https://www.thecocktaildb.com/images/media/drink/wpxpvu1439905379.jpg', // Margarita Frozen → Margarita
  26: 'https://www.thecocktaildb.com/images/media/drink/tsssur1479209062.jpg', // Paloma
  27: 'https://www.thecocktaildb.com/images/media/drink/dnaldm1604838951.jpg', // Gin Fizz
  28: 'https://www.thecocktaildb.com/images/media/drink/vqr4p11484994500.jpg', // Clover Club
  29: 'https://www.thecocktaildb.com/images/media/drink/qgdu971561574065.jpg', // Negroni Sbagliato → Negroni
  30: 'https://www.thecocktaildb.com/images/media/drink/d3lcs01589574721.jpg', // Mimosa
  31: 'https://www.thecocktaildb.com/images/media/drink/d84ocd1606770165.jpg', // Dark n Stormy
  32: 'https://www.thecocktaildb.com/images/media/drink/ymfnt01504372471.jpg', // Caipirinha de Morango → Caipirinha
  33: 'https://www.thecocktaildb.com/images/media/drink/384sxs1504370034.jpg', // Americano
  34: 'https://www.thecocktaildb.com/images/media/drink/tpqvqt1472723699.jpg', // Sea Breeze
  35: 'https://www.thecocktaildb.com/images/media/drink/vvpvqt1472680678.jpg', // Mint Julep
  36: 'https://www.thecocktaildb.com/images/media/drink/ymfnt01504372471.jpg', // Caipirinha de Maracujá → Caipirinha
  37: 'https://www.thecocktaildb.com/images/media/drink/yrtwtv1454514968.jpg', // Bee's Knees
  38: 'https://www.thecocktaildb.com/images/media/drink/sxpstream1504368344.jpg', // Boulevardier
  39: 'https://www.thecocktaildb.com/images/media/drink/ka0uo71504372602.jpg', // Bramble
  40: 'https://www.thecocktaildb.com/images/media/drink/eg8z8q1504371895.jpg', // French 75
  41: 'https://www.thecocktaildb.com/images/media/drink/384sxs1504370034.jpg', // Garibaldi → Americano
  42: 'https://www.thecocktaildb.com/images/media/drink/3gltv21504366426.jpg', // Gin Basil Smash → Gin Tônica
  43: 'https://www.thecocktaildb.com/images/media/drink/tqpvqp1472723698.jpg', // Irish Coffee
  44: 'https://www.thecocktaildb.com/images/media/drink/hbkfsh1589574990.jpg', // John Collins → Tom Collins
  45: 'https://www.thecocktaildb.com/images/media/drink/hpkBm21606769855.jpg', // Manhattan
  46: 'https://www.thecocktaildb.com/images/media/drink/s4ym631504367485.jpg', // New York Sour → Whisky Sour
  47: 'https://www.thecocktaildb.com/images/media/drink/s4ym631504367485.jpg', // Penicillin → Whisky Sour
  48: 'https://www.thecocktaildb.com/images/media/drink/ubvpsp1504699134.jpg', // Pisco Sour
  49: 'https://www.thecocktaildb.com/images/media/drink/qgdu971561574065.jpg', // Rabo de Galo → Negroni
  50: 'https://www.thecocktaildb.com/images/media/drink/uwvyts1483387938.jpg', // Porn Star Martini
  51: 'https://www.thecocktaildb.com/images/media/drink/wpxpvu1439905379.jpg', // Tommy's Margarita → Margarita
  52: 'https://www.thecocktaildb.com/images/media/drink/v3yxqb1574694694.jpg', // White Lady
};

export default drinkPhotos;
