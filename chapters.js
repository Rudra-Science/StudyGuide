/* Chapter names shared by the site and the admin page.
   Links are NOT stored here. Add them from the admin page (they are saved privately in Firebase). */
const CHAPTERS = {
  "Science": [
    "Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals",
    "Carbon and its Compounds","Life Processes","Control and Coordination",
    "How do Organisms Reproduce?","Heredity","Light: Reflection and Refraction",
    "The Human Eye and the Colourful World","Electricity","Magnetic Effects of Electric Current",
    "Our Environment"
  ],
  "Maths": "SOON",
  "SST": {
    "History": [
      "The Rise of Nationalism in Europe","Nationalism in India","The Making of a Global World",
      "The Age of Industrialisation","Print Culture and the Modern World"
    ],
    "Civics": [
      "Power Sharing","Federalism","Gender, Religion and Caste",
      "Political Parties","Outcomes of Democracy"
    ],
    "Geography": [
      "Resources and Development","Forest and Wildlife Resources","Water Resources",
      "Agriculture","Minerals and Energy Resources","Manufacturing Industries",
      "Lifelines of National Economy"
    ],
    "Economics": [
      "Development","Sectors of the Indian Economy","Money and Credit",
      "Globalisation and the Indian Economy","Consumer Rights"
    ]
  }
};
function chKey(sub,grp,i){return (sub+'-'+(grp||'')+'-'+i).toLowerCase().replace(/\s+/g,'_')}
