import { getCurrentLanguage, addLanguageChangeListener } from './ui-language.js';

const sectionTextContainer = document.getElementById('section-text-container');
const sectionTextDiv = document.getElementById('section-text');

// Overlay DOM Elements
const detailsOverlay = document.getElementById('details-overlay');
const detailsOverlayBody = document.getElementById('details-overlay-body');
const detailsOverlayClose = document.querySelector('.details-overlay-close');
const detailsOverlayContent = document.getElementById('details-overlay-content');

let waypointsRef = [];
let pathCurveRef = null;
let carModelRef = null;

let currentSectionIndex = -1; // Not in any section initially

// Section definitions with SVG icons
const sections = [
    {
        name: "Camera", start: 6, end: 16,
        detailedContent_en: `
            <h1>Injustice: When Speaking Up Isn’t Enough</h1>
            <p>Imagine living in a town where your air is polluted, your children play beneath skies dusted with graphite, and you have proof—clear video evidence—that pollution standards are being violated. But then, imagine sending that video to the authorities, only for it to disappear due to “privacy concerns.” That is the harsh reality for many residents in IJmond, where Tata Steel’s emissions have sparked not just health fears but a larger struggle for environmental justice.</p>
            <p>Residents and regulatory agencies like the Omgevingsdienst Noordzeekanaalgebied have attempted to hold Tata Steel accountable using camera surveillance to monitor pollution. These cameras, placed around the Tata factory, were meant to independently verify environmental violations. However, Tata Steel challenged this practice in court, arguing that such surveillance violated employee privacy and required a specific legal basis. The court ruled that the Environmental Service is allowed to continue its camera monitoring, highlighting the importance of independent oversight—particularly when the polluter previously controlled the data used to assess their own violations (Rechtspraak, 2024).</p>
            <p>Despite this ruling, many complaints still go unseen or are dismissed. A loophole in the current complaint system means that once a video has been in Tata Steel’s possession for over two weeks, it must be deleted—regardless of whether it was reviewed or not. This bureaucratic flaw means that hard evidence from concerned citizens is routinely erased, and real environmental harms go unpunished.</p>
            <p>This situation raises major concerns. First, it questions how citizens can advocate for their health and safety if the very systems meant to protect them are slow, ineffective, or biased in favor of powerful corporations. Second, it highlights a dangerous precedent: that privacy laws can be used to shield polluters, rather than the people affected by pollution. Most importantly, it sends a chilling message—that your voice, your video, your complaint, might not matter.</p>
            <p>Everyone deserves clean air. Everyone deserves to live without fear of pollution.</p>
            <p>Let’s learn from the past and fight for a cleaner future, before the next dust rain falls.</p>
            <div class="bibliography">
                <h3>Bibliography</h3>
                <ul>
                    <li>Rechtspraak. (2024, February 8). Omgevingsdienst mag cameratoezicht blijven uitvoeren op fabriek Tata Steel. Rechtbank Noord-Holland. Retrieved May 16, 2025, from https://www.rechtspraak.nl/Organisatie-en-contact/Organisatie/Rechtbanken/Rechtbank-Noord-Holland/Nieuws/Paginas/Omgevingsdienst-mag-cameratoezicht-blijven-uitvoeren-op-fabriek-Tata-Steel.aspx</li>
                </ul>
            </div>
        `,
        detailedContent_nl: `
            <h1>Onrecht: Wanneer Je Stem Laten Horen Niet Genoeg Is</h1>
            <p>Stel je voor dat je in een stad woont waar de lucht vervuild is, je kinderen spelen onder een hemel bestoven met grafiet, en je hebt bewijs – duidelijk videobewijs – dat vervuilingsnormen worden overtreden. Maar stel je dan voor dat je die video naar de autoriteiten stuurt, alleen om te ontdekken dat deze verdwijnt vanwege “privacykwesties”. Dat is de harde realiteit voor veel inwoners in de IJmond, waar de uitstoot van Tata Steel niet alleen gezondheidsangsten heeft aangewakkerd, maar ook een grotere strijd voor milieurechtvaardigheid.</p>
            <p>Inwoners en regelgevende instanties zoals de Omgevingsdienst Noordzeekanaalgebied hebben geprobeerd Tata Steel ter verantwoording te roepen door middel van cameratoezicht om vervuiling te monitoren. Deze camera's, geplaatst rond de Tata-fabriek, waren bedoeld om milieuovertredingen onafhankelijk te verifiëren. Tata Steel vocht deze praktijk echter aan in de rechtbank, met het argument dat dergelijk toezicht de privacy van werknemers schond en een specifieke wettelijke basis vereiste. De rechtbank oordeelde dat de Omgevingsdienst zijn cameratoezicht mag voortzetten, wat het belang van onafhankelijk toezicht benadrukt – vooral omdat de vervuiler voorheen de gegevens controleerde die werden gebruikt om hun eigen overtredingen te beoordelen (Rechtspraak, 2024).</p>
            <p>Ondanks deze uitspraak blijven veel klachten ongezien of worden ze afgewezen. Een maas in het huidige klachtensysteem betekent dat zodra een video langer dan twee weken in het bezit is van Tata Steel, deze moet worden verwijderd – ongeacht of deze is beoordeeld of niet. Deze bureaucratische tekortkoming betekent dat hard bewijs van bezorgde burgers routinematig wordt gewist en echte milieuschade onbestraft blijft.</p>
            <p>Deze situatie roept grote zorgen op. Ten eerste stelt het de vraag hoe burgers kunnen opkomen voor hun gezondheid en veiligheid als de systemen die hen moeten beschermen traag, ineffectief of bevooroordeeld zijn ten gunste van machtige bedrijven. Ten tweede benadrukt het een gevaarlijk precedent: dat privacywetten kunnen worden gebruikt om vervuilers te beschermen, in plaats van de mensen die door vervuiling worden getroffen. Het belangrijkste is dat het een angstaanjagende boodschap uitzendt – dat jouw stem, jouw video, jouw klacht, er misschien niet toe doet.</p>
            <p>Iedereen verdient schone lucht. Iedereen verdient het om zonder angst voor vervuiling te leven.</p>
            <p>Laten we leren van het verleden en vechten voor een schonere toekomst, voordat de volgende stofregen valt.</p>
            <div class="bibliography">
                <h3>Bibliografie</h3>
                <ul>
                    <li>Rechtspraak. (2024, 8 februari). Omgevingsdienst mag cameratoezicht blijven uitvoeren op fabriek Tata Steel. Rechtbank Noord-Holland. Geraadpleegd op 16 mei 2025, van https://www.rechtspraak.nl/Organisatie-en-contact/Organisatie/Rechtbanken/Rechtbank-Noord-Holland/Nieuws/Paginas/Omgevingsdienst-mag-cameratoezicht-blijven-uitvoeren-op-fabriek-Tata-Steel.aspx</li>
                </ul>
            </div>
        `,
        en: { 
            title: "Injustice: When Speaking Up Isn’t Enough", 
            subtitle: "The struggle for environmental justice in IJmond.", 
            content: "Residents face challenges getting pollution violations addressed due to bureaucratic flaws and privacy concerns, despite court rulings supporting surveillance.", 
            expandedContent: "Imagine living in a town where your air is polluted, your children play beneath skies dusted with graphite, and you have proof—clear video evidence—that pollution standards are being violated. But then, imagine sending that video to the authorities, only for it to disappear due to “privacy concerns.” That is the harsh reality for many residents in IJmond, where Tata Steel’s emissions have sparked not just health fears but a larger struggle for environmental justice.\n\nResidents and regulatory agencies like the Omgevingsdienst Noordzeekanaalgebied have attempted to hold Tata Steel accountable using camera surveillance to monitor pollution. These cameras, placed around the Tata factory, were meant to independently verify environmental violations. However, Tata Steel challenged this practice in court, arguing that such surveillance violated employee privacy and required a specific legal basis. The court ruled that the Environmental Service is allowed to continue its camera monitoring, highlighting the importance of independent oversight—particularly when the polluter previously controlled the data used to assess their own violations (Rechtspraak, 2024).\n\nDespite this ruling, many complaints still go unseen or are dismissed. A loophole in the current complaint system means that once a video has been in Tata Steel’s possession for over two weeks, it must be deleted—regardless of whether it was reviewed or not. This bureaucratic flaw means that hard evidence from concerned citizens is routinely erased, and real environmental harms go unpunished.\n\nThis situation raises major concerns. First, it questions how citizens can advocate for their health and safety if the very systems meant to protect them are slow, ineffective, or biased in favor of powerful corporations. Second, it highlights a dangerous precedent: that privacy laws can be used to shield polluters, rather than the people affected by pollution. Most importantly, it sends a chilling message—that your voice, your video, your complaint, might not matter.\n\nEveryone deserves clean air. Everyone deserves to live without fear of pollution.\n\nLet’s learn from the past and fight for a cleaner future, before the next dust rain falls."
        },
        nl: { 
            title: "Onrecht: Wanneer Je Stem Laten Horen Niet Genoeg Is", 
            subtitle: "De strijd voor milieurechtvaardigheid in de IJmond.", 
            content: "Inwoners ondervinden problemen bij het aanpakken van vervuilingsovertredingen door bureaucratische tekortkomingen en privacykwesties, ondanks rechterlijke uitspraken die toezicht ondersteunen.", 
            expandedContent: "Stel je voor dat je in een stad woont waar de lucht vervuild is, je kinderen spelen onder een hemel bestoven met grafiet, en je hebt bewijs – duidelijk videobewijs – dat vervuilingsnormen worden overtreden. Maar stel je dan voor dat je die video naar de autoriteiten stuurt, alleen om te ontdekken dat deze verdwijnt vanwege “privacykwesties”. Dat is de harde realiteit voor veel inwoners in de IJmond, waar de uitstoot van Tata Steel niet alleen gezondheidsangsten heeft aangewakkerd, maar ook een grotere strijd voor milieurechtvaardigheid.\n\nInwoners en regelgevende instanties zoals de Omgevingsdienst Noordzeekanaalgebied hebben geprobeerd Tata Steel ter verantwoording te roepen door middel van cameratoezicht om vervuiling te monitoren. Deze camera's, geplaatst rond de Tata-fabriek, waren bedoeld om milieuovertredingen onafhankelijk te verifiëren. Tata Steel vocht deze praktijk echter aan in de rechtbank, met het argument dat dergelijk toezicht de privacy van werknemers schond en een specifieke wettelijke basis vereiste. De rechtbank oordeelde dat de Omgevingsdienst zijn cameratoezicht mag voortzetten, wat het belang van onafhankelijk toezicht benadrukt – vooral omdat de vervuiler voorheen de gegevens controleerde die werden gebruikt om hun eigen overtredingen te beoordelen (Rechtspraak, 2024).\n\nOndanks deze uitspraak blijven veel klachten ongezien of worden ze afgewezen. Een maas in het huidige klachtensysteem betekent dat zodra een video langer dan twee weken in het bezit is van Tata Steel, deze moet worden verwijderd – ongeacht of deze is beoordeeld of niet. Deze bureaucratische tekortkoming betekent dat hard bewijs van bezorgde burgers routinematig wordt gewist en echte milieuschade onbestraft blijft.\n\nDeze situatie roept grote zorgen op. Ten eerste stelt het de vraag hoe burgers kunnen opkomen voor hun gezondheid en veiligheid als de systemen die hen moeten beschermen traag, ineffectief of bevooroordeeld zijn ten gunste van machtige bedrijven. Ten tweede benadrukt het een gevaarlijk precedent: dat privacywetten kunnen worden gebruikt om vervuilers te beschermen, in plaats van de mensen die door vervuiling worden getroffen. Het belangrijkste is dat het een angstaanjagende boodschap uitzendt – dat jouw stem, jouw video, jouw klacht, er misschien niet toe doet.\n\nIedereen verdient schone lucht. Iedereen verdient het om zonder angst voor vervuiling te leven.\n\nLaten we leren van het verleden en vechten voor een schonere toekomst, voordat de volgende stofregen valt."
        },
        iconSVG: `<svg class="icon-camera" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="#f47a23" /><rect x="16" y="2" width="4" height="4" rx="1" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-camera.jpg',
    },
    {
        name: "Village", start: 28, end: 36,
        detailedContent_en: `
            <h1>First Dust Fall</h1>
            <h2>Iteration 8: Dust rains</h2>
            <p>Back in 1991, something strange happened in the IJmond region, near the Tata Steel factory. People looked outside and noticed a fine layer of dust falling from the sky. But it wasn’t just normal dust, it was dark, dirt and stuck to everything. Locals started calling it dust rain.</p>
            <p>The dust wasn’t harmless. It came from Tata Steel which was full of dangerous substances like heavy metals and sulfur compounds. That first dust rain was a warning sign, but instead of getting better, things only got worse over time.</p>
            <p>Since then, many more dust rains have happened. People in towns like Wijk aan Zee have seen the dust everywhere on their windowsills, outdoor tables, and playgrounds. The RIVM have found that the dust contains substances that can harm your lungs, damage soil, and even cause cancer.</p>
            <p>Residents started getting sick more often. Some had breathing problems, others developed serious illnesses like cancer. Studies from the RIVM have concluded that the rates of cancer are higher in IJmond and that people live 3 months less than the average Dutch person.</p>
            <p>It’s not just an environmental problem, it’s a public health crisis. People are worried, angry and tired of being ignored. They want clean air too, and to be able to let their children play outside without worrying about invisible poisons.</p>
            <p>The first dust rain in 1991 was a sign that something is seriously wrong and after nearly 35 years there still hasn’t been much done to protect the people.</p>
            <p>Everyone deserves clean air. Everyone deserves to live without fear of pollution.</p>
            <p>Let’s learn from the past and fight for a cleaner future, before the next dust rain falls.</p>
        `,
        detailedContent_nl: `
            <h1>Eerste Stofregen</h1>
            <h2>Iteratie 8: Stofregens</h2>
            <p>In 1991 gebeurde er iets vreemds in de IJmond-regio, nabij de Tata Steel-fabriek. Mensen keken naar buiten en merkten een fijne laag stof op die uit de lucht viel. Maar het was niet zomaar stof, het was donker, vuil en plakte aan alles. Omwonenden noemden het stofregen.</p>
            <p>Het stof was niet onschadelijk. Het kwam van Tata Steel en zat vol gevaarlijke stoffen zoals zware metalen en zwavelverbindingen. Die eerste stofregen was een waarschuwing, maar in plaats van beter te worden, werden de dingen na verloop van tijd alleen maar erger.</p>
            <p>Sindsdien hebben er nog veel meer stofregens plaatsgevonden. Mensen in plaatsen als Wijk aan Zee hebben het stof overal gezien: op hun vensterbanken, tuintafels en speelplaatsen. Het RIVM heeft ontdekt dat het stof stoffen bevat die de longen kunnen beschadigen, de bodem kunnen aantasten en zelfs kanker kunnen veroorzaken.</p>
            <p>Bewoners werden vaker ziek. Sommigen kregen ademhalingsproblemen, anderen ontwikkelden ernstige ziekten zoals kanker. Studies van het RIVM hebben geconcludeerd dat de kankercijfers hoger zijn in de IJmond en dat mensen er gemiddeld 3 maanden korter leven dan de gemiddelde Nederlander.</p>
            <p>Het is niet alleen een milieuprobleem, het is een volksgezondheidscrisis. Mensen zijn bezorgd, boos en moe van het genegeerd worden. Ook zij willen schone lucht en hun kinderen buiten kunnen laten spelen zonder zich zorgen te hoeven maken over onzichtbare vergiften.</p>
            <p>De eerste stofregen in 1991 was een teken dat er iets ernstig mis is, en na bijna 35 jaar is er nog steeds niet veel gedaan om de mensen te beschermen.</p>
            <p>Iedereen verdient schone lucht. Iedereen verdient het om zonder angst voor vervuiling te leven.</p>
            <p>Laten we leren van het verleden en vechten voor een schonere toekomst, voordat de volgende stofregen valt.</p>
        `,
        en: { 
            title: "First Dust Fall", 
            subtitle: "A Warning Sign for IJmond", 
            content: "The 1991 'dust rain' near Tata Steel marked the beginning of ongoing hazardous pollution, impacting IJmond's health and environment with serious illnesses and higher cancer rates.", 
            expandedContent: "Back in 1991, something strange happened in the IJmond region, near the Tata Steel factory. People looked outside and noticed a fine layer of dust falling from the sky. But it wasn’t just normal dust, it was dark, dirt and stuck to everything. Locals started calling it dust rain.\n\nThe dust wasn’t harmless. It came from Tata Steel which was full of dangerous substances like heavy metals and sulfur compounds. That first dust rain was a warning sign, but instead of getting better, things only got worse over time.\n\nSince then, many more dust rains have happened. People in towns like Wijk aan Zee have seen the dust everywhere on their windowsills, outdoor tables, and playgrounds. The RIVM have found that the dust contains substances that can harm your lungs, damage soil, and even cause cancer."
        },
        nl: { 
            title: "Eerste Stofregen", 
            subtitle: "Een Waarschuwingssignaal voor IJmond", 
            content: "De 'stofregen' van 1991 nabij Tata Steel markeerde het begin van aanhoudende gevaarlijke vervuiling, die de gezondheid en het milieu in de IJmond beïnvloedt met ernstige ziekten en hogere kankercijfers.", 
            expandedContent: "In 1991 gebeurde er iets vreemds in de IJmond-regio, nabij de Tata Steel-fabriek. Mensen keken naar buiten en merkten een fijne laag stof op die uit de lucht viel. Maar het was niet zomaar stof, het was donker, vuil en plakte aan alles. Omwonenden noemden het stofregen.\n\nHet stof was niet onschadelijk. Het kwam van Tata Steel en zat vol gevaarlijke stoffen zoals zware metalen en zwavelverbindingen. Die eerste stofregen was een waarschuwing, maar in plaats van beter te worden, werden de dingen na verloop van tijd alleen maar erger.\n\nSindsdien hebben er nog veel meer stofregens plaatsgevonden. Mensen in plaatsen als Wijk aan Zee hebben het stof overal gezien: op hun vensterbanken, tuintafels en speelplaatsen. Het RIVM heeft ontdekt dat het stof stoffen bevat die de longen kunnen beschadigen, de bodem kunnen aantasten en zelfs kanker kunnen veroorzaken."
        },
        iconSVG: `<svg class="icon-village" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1,21V10L8,3L15,10V21H1Z" /><path d="M12,21V14H22V21H12Z" /><path d="M5,12V14H8V12H5Z" fill="#f47a23" /><path d="M15,18V20H18V18H15Z" fill="#f47a23" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-village.jpg',
    },
    {
        name: "Playground", start: 43, end: 49,
        detailedContent_en: `
            <h1>Graphite Rain: A Playground Hazard</h1>
            <p>In recent years, residents of the IJmond region, particularly in Wijk aan Zee, have witnessed the troubling phenomenon of graphite rain, a form of pollution linked to emissions from the Tata Steel plant in IJmuiden. Local observations initially reported black dust particles appearing on playgrounds and outdoor furniture, prompting scientific and governmental investigation.</p>
            <p>Graphite rain is not merely a cosmetic issue, it contains heavy metals and carcinogenic substances that pose serious public health risks (NL Times, 2020). Research by the Dutch public health institute RIVM revealed a dramatic increase of up to four times in the presence of carcinogenic substances in Wijk aan Zee within a single year. In the summer of 2021, lead levels in the village were also significantly higher than the year before (NL Times, 2023). Additional measurements showed that pollution levels in nearby areas such as Heemskerkerduin, Beverdijk, and IJmuiden were on average twice as high as in regions outside of IJmond. The monitoring station in Wijk aan Zee, located near the Tata Steel site, recorded levels up to five times higher than elsewhere (NL Times, 2023).</p>
            <p style="text-align: center;"><img src="images/playground_graphite.jpg" alt="Playground with graphite dust" style="max-width: 100%; height: auto;"></p>
            <p>The primary components of graphite rain include polycyclic aromatic hydrocarbons (PAHs), which are byproducts of burning fossil fuels and other organic substances (NL Times, 2020). These substances are widely recognized for their toxicity and are known to cause cancer, as well as damage to the eyes, liver, and kidneys. Experts emphasize that exposure to PAHs is dangerous due to their genetic impact: they can alter DNA, which may result in uncontrolled cell growth and, consequently, cancers such as lung cancer—the organ most directly exposed through inhalation (NL Times, 2023).</p>
            <p>The consequences for IJmond residents are far-reaching. Beyond the physical health effects, there is increasing frustration over the perceived inaction of both Tata Steel and governmental authorities. Professor Onno van Schayck condemned the failure to act on available data as "negligent"—not only on the part of Tata Steel, but also among the licensing bodies, the province, and public health agencies such as the GGD. He stressed that the dangers of these substances have been known for decades. “We already knew 50 years ago that these substances are carcinogenic,” he said, referencing their similarity to compounds found in cigarettes (NL Times, 2023).</p>
            <p>Despite decades of warnings, meaningful regulatory intervention has lagged. Residents and experts alike are calling for urgent action to protect public health and hold polluters accountable. “People are dying here,” Van Schayck warned. “We have been chasing this problem for 50 years” (NL Times, 2023).</p>
            <p>Graphite rain is not just a local issue. It is emblematic of environmental injustice, regulatory failure, and industrial negligence. As pollution continues to endanger lives in IJmond, the case for decisive environmental policy has never been more urgent.</p>
            <div class="bibliography">
                <h3>Bibliography</h3>
                <ul>
                    <li>NL Times. (2020, October 22). Tata Steel to be prosecuted for heavy metal spreading in graphite rains. https://nltimes.nl/2020/10/22/tata-steel-prosecuted-heavy-metal-spreading-graphite-rains</li>
                    <li>NL Times. (2023, September 20). Concerns about carcinogens from IJmuiden steel factory date back to 1975. https://nltimes.nl/2023/09/20/concerns-carcinogens-ijmuiden-steel-factory-date-back-1975</li>
                </ul>
            </div>
        `,
        detailedContent_nl: `
            <h1>Grafietregen: Een Gevaar voor Speeltuinen</h1>
            <p>In de afgelopen jaren hebben inwoners van de IJmond-regio, met name in Wijk aan Zee, het zorgwekkende fenomeen van grafietregen waargenomen, een vorm van vervuiling die verband houdt met de uitstoot van de Tata Steel-fabriek in IJmuiden. Lokale waarnemingen meldden aanvankelijk zwarte stofdeeltjes op speeltuinen en tuinmeubilair, wat leidde tot wetenschappelijk en overheidsonderzoek.</p>
            <p>Grafietregen is niet slechts een cosmetisch probleem; het bevat zware metalen en kankerverwekkende stoffen die ernstige volksgezondheidsrisico's met zich meebrengen (NL Times, 2020). Onderzoek door het RIVM wees uit dat de aanwezigheid van kankerverwekkende stoffen in Wijk aan Zee binnen een jaar tot vier keer toenam. In de zomer van 2021 waren de loodniveaus in het dorp ook significant hoger dan het jaar ervoor (NL Times, 2023). Aanvullende metingen toonden aan dat de vervuilingsniveaus in nabijgelegen gebieden zoals Heemskerkerduin, Beverdijk en IJmuiden gemiddeld twee keer zo hoog waren als in regio's buiten de IJmond. Het meetstation in Wijk aan Zee, gelegen nabij het Tata Steel-terrein, registreerde niveaus die tot vijf keer hoger waren dan elders (NL Times, 2023).</p>
            <p style="text-align: center;"><img src="images/playground_graphite.jpg" alt="Speeltuin met grafietstof" style="max-width: 100%; height: auto;"></p>
            <p>De belangrijkste componenten van grafietregen zijn polycyclische aromatische koolwaterstoffen (PAK's), bijproducten van de verbranding van fossiele brandstoffen en andere organische stoffen (NL Times, 2020). Deze stoffen staan algemeen bekend om hun toxiciteit en veroorzaken kanker, evenals schade aan ogen, lever en nieren. Experts benadrukken dat blootstelling aan PAK's gevaarlijk is vanwege hun genetische impact: ze kunnen DNA veranderen, wat kan leiden tot ongecontroleerde celgroei en dientengevolge kankers zoals longkanker – het orgaan dat het meest direct wordt blootgesteld via inademing (NL Times, 2023).</p>
            <p>De gevolgen voor de inwoners van de IJmond zijn verstrekkend. Naast de fysieke gezondheidseffecten is er toenemende frustratie over de vermeende passiviteit van zowel Tata Steel als de overheidsinstanties. Professor Onno van Schayck veroordeelde het uitblijven van actie op basis van beschikbare gegevens als "nalatig" – niet alleen van de kant van Tata Steel, maar ook van de vergunningverlenende instanties, de provincie en volksgezondheidsorganisaties zoals de GGD. Hij benadrukte dat de gevaren van deze stoffen al decennia bekend zijn. “We wisten 50 jaar geleden al dat deze stoffen kankerverwekkend zijn,” zei hij, verwijzend naar hun gelijkenis met verbindingen die in sigaretten worden aangetroffen (NL Times, 2023).</p>
            <p>Ondanks decennia van waarschuwingen is een betekenisvolle regelgevende interventie uitgebleven. Zowel inwoners als experts roepen op tot dringende actie om de volksgezondheid te beschermen en vervuilers ter verantwoording te roepen. “Hier gaan mensen dood,” waarschuwde Van Schayck. “We jagen al 50 jaar achter dit probleem aan” (NL Times, 2023).</p>
            <p>Grafietregen is niet alleen een lokaal probleem. Het is een symbool van milieurechtvaardigheid, falende regelgeving en industriële nalatigheid. Nu vervuiling levens in de IJmond blijft bedreigen, is de noodzaak voor een daadkrachtig milieubeleid urgenter dan ooit.</p>
            <div class="bibliography">
                <h3>Bibliografie</h3>
                <ul>
                    <li>NL Times. (2020, 22 oktober). Tata Steel to be prosecuted for heavy metal spreading in graphite rains. https://nltimes.nl/2020/10/22/tata-steel-prosecuted-heavy-metal-spreading-graphite-rains</li>
                    <li>NL Times. (2023, 20 september). Concerns about carcinogens from IJmuiden steel factory date back to 1975. https://nltimes.nl/2023/09/20/concerns-carcinogens-ijmuiden-steel-factory-date-back-1975</li>
                </ul>
            </div>
        `,
        en: { 
            title: "Graphite Rain: A Playground Hazard", 
            subtitle: "The health risks of industrial pollution in community spaces.", 
            content: "Graphite rain from Tata Steel contaminates playgrounds with heavy metals and carcinogens, posing serious health risks to children in the IJmond region.", 
            expandedContent: "In recent years, residents of the IJmond region, particularly in Wijk aan Zee, have witnessed the troubling phenomenon of graphite rain, a form of pollution linked to emissions from the Tata Steel plant in IJmuiden. Local observations initially reported black dust particles appearing on playgrounds and outdoor furniture, prompting scientific and governmental investigation.\n\nGraphite rain is not merely a cosmetic issue, it contains heavy metals and carcinogenic substances that pose serious public health risks (NL Times, 2020). Research by the Dutch public health institute RIVM revealed a dramatic increase of up to four times in the presence of carcinogenic substances in Wijk aan Zee within a single year. In the summer of 2021, lead levels in the village were also significantly higher than the year before (NL Times, 2023). Additional measurements showed that pollution levels in nearby areas such as Heemskerkerduin, Beverdijk, and IJmuiden were on average twice as high as in regions outside of IJmond. The monitoring station in Wijk aan Zee, located near the Tata Steel site, recorded levels up to five times higher than elsewhere (NL Times, 2023).\n\nThe primary components of graphite rain include polycyclic aromatic hydrocarbons (PAHs), which are byproducts of burning fossil fuels and other organic substances (NL Times, 2020). These substances are widely recognized for their toxicity and are known to cause cancer, as well as damage to the eyes, liver, and kidneys. Experts emphasize that exposure to PAHs is dangerous due to their genetic impact: they can alter DNA, which may result in uncontrolled cell growth and, consequently, cancers such as lung cancer—the organ most directly exposed through inhalation (NL Times, 2023).\n\nThe consequences for IJmond residents are far-reaching. Beyond the physical health effects, there is increasing frustration over the perceived inaction of both Tata Steel and governmental authorities. Professor Onno van Schayck condemned the failure to act on available data as \"negligent\"—not only on the part of Tata Steel, but also among the licensing bodies, the province, and public health agencies such as the GGD. He stressed that the dangers of these substances have been known for decades. “We already knew 50 years ago that these substances are carcinogenic,” he said, referencing their similarity to compounds found in cigarettes (NL Times, 2023).\n\nDespite decades of warnings, meaningful regulatory intervention has lagged. Residents and experts alike are calling for urgent action to protect public health and hold polluters accountable. “People are dying here,” Van Schayck warned. “We have been chasing this problem for 50 years” (NL Times, 2023).\n\nGraphite rain is not just a local issue. It is emblematic of environmental injustice, regulatory failure, and industrial negligence. As pollution continues to endanger lives in IJmond, the case for decisive environmental policy has never been more urgent."
        },
        nl: { 
            title: "Grafietregen: Een Gevaar voor Speeltuinen", 
            subtitle: "De gezondheidsrisico's van industriële vervuiling in openbare ruimtes.", 
            content: "Grafietregen van Tata Steel vervuilt speeltuinen met zware metalen en kankerverwekkende stoffen, wat ernstige gezondheidsrisico's voor kinderen in de IJmond-regio met zich meebrengt.", 
            expandedContent: "In de afgelopen jaren hebben inwoners van de IJmond-regio, met name in Wijk aan Zee, het zorgwekkende fenomeen van grafietregen waargenomen, een vorm van vervuiling die verband houdt met de uitstoot van de Tata Steel-fabriek in IJmuiden. Lokale waarnemingen meldden aanvankelijk zwarte stofdeeltjes op speeltuinen en tuinmeubilair, wat leidde tot wetenschappelijk en overheidsonderzoek.\n\nGrafietregen is niet slechts een cosmetisch probleem; het bevat zware metalen en kankerverwekkende stoffen die ernstige volksgezondheidsrisico's met zich meebrengen (NL Times, 2020). Onderzoek door het RIVM wees uit dat de aanwezigheid van kankerverwekkende stoffen in Wijk aan Zee binnen een jaar tot vier keer toenam. In de zomer van 2021 waren de loodniveaus in het dorp ook significant hoger dan het jaar ervoor (NL Times, 2023). Aanvullende metingen toonden aan dat de vervuilingsniveaus in nabijgelegen gebieden zoals Heemskerkerduin, Beverdijk en IJmuiden gemiddeld twee keer zo hoog waren als in regio's buiten de IJmond. Het meetstation in Wijk aan Zee, gelegen nabij het Tata Steel-terrein, registreerde niveaus die tot vijf keer hoger waren dan elders (NL Times, 2023).\n\nDe belangrijkste componenten van grafietregen zijn polycyclische aromatische koolwaterstoffen (PAK's), bijproducten van de verbranding van fossiele brandstoffen en andere organische stoffen (NL Times, 2020). Deze stoffen staan algemeen bekend om hun toxiciteit en veroorzaken kanker, evenals schade aan ogen, lever en nieren. Experts benadrukken dat blootstelling aan PAK's gevaarlijk is vanwege hun genetische impact: ze kunnen DNA veranderen, wat kan leiden tot ongecontroleerde celgroei en dientengevolge kankers zoals longkanker – het orgaan dat het meest direct wordt blootgesteld via inademing (NL Times, 2023).\n\nDe gevolgen voor de inwoners van de IJmond zijn verstrekkend. Naast de fysieke gezondheidseffecten is er toenemende frustratie over de vermeende passiviteit van zowel Tata Steel als de overheidsinstanties. Professor Onno van Schayck veroordeelde het uitblijven van actie op basis van beschikbare gegevens als \"nalatig\" – niet alleen van de kant van Tata Steel, maar ook van de vergunningverlenende instanties, de provincie en volksgezondheidsorganisaties zoals de GGD. Hij benadrukte dat de gevaren van deze stoffen al decennia bekend zijn. “We wisten 50 jaar geleden al dat deze stoffen kankerverwekkend zijn,” zei hij, verwijzend naar hun gelijkenis met verbindingen die in sigaretten worden aangetroffen (NL Times, 2023).\n\nOndanks decennia van waarschuwingen is een betekenisvolle regelgevende interventie uitgebleven. Zowel inwoners als experts roepen op tot dringende actie om de volksgezondheid te beschermen en vervuilers ter verantwoording te roepen. “Hier gaan mensen dood,” waarschuwde Van Schayck. “We jagen al 50 jaar achter dit probleem aan” (NL Times, 2023).\n\nGrafietregen is niet alleen een lokaal probleem. Het is een symbool van milieurechtvaardigheid, falende regelgeving en industriële nalatigheid. Nu vervuiling levens in de IJmond blijft bedreigen, is de noodzaak voor een daadkrachtig milieubeleid urgenter dan ooit."
        },
        iconSVG: `<svg class="icon-playground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8,2V8H4L8,22H10L6,8H8V2Z" class="swing" /><path d="M16,2V8H12L16,22H18L14,8H16V2Z" class="swing" /><path d="M2,8H22V10H2V8Z" stroke="#74c047" stroke-width="0.5" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-playground.jpg',
    },
    {
        name: "Tata", start: 55, end: 62,
        detailedContent_en: `
            <h1>Tata Steel’s Green Future: Is It Too Much, Too Late?</h1>
            <p>Tata Steel has long played a central role in the Netherlands' industrial sector, particularly in IJmuiden, where its operations have brought both economic value and serious environmental concerns. In recent years, the company has begun a transition toward more sustainable practices, with ambitious goals for becoming CO2-neutral. However, the critical question remains: are these efforts arriving too late, and are they enough to address the decades of damage already done?</p>
            <p>Tata Steel Nederland has committed to significant green steel initiatives. According to the company, “we are redeveloping the very heart of our production process and will be making steel based on hydrogen. We expect this to reduce CO2 emissions by 35 to 40% by 2030. Our goal is to produce completely CO2-neutral steel by 2045” (Tata Steel Nederland). This shift toward hydrogen-based steel production mirrors broader trends in the European steel industry, where other companies like SSAB and Ovako are already leading the way with fossil-free steelmaking technologies.</p>
            <p>In addition to their long-term goals, Tata also launched the “Roadmap Plus,” a set of environmental measures set to be completed by 2025. These measures aim to reduce pollution and improve the local living environment for residents of IJmond and surrounding areas. As stated on their site, “through the measures from the Roadmap Plus, we are also working on a better living environment” (Tata Roadmap Plus).</p>
            <p>While these developments are promising on paper, many critics argue they have only come in response to mounting public pressure. It wasn’t until repeated reports of graphite rain, elevated cancer risks, and environmental degradation in the region that Tata began seriously implementing green initiatives. In that sense, Tata’s sustainability push can feel more like damage control than visionary leadership.</p>
            <p>That’s why public voices—especially those of younger generations—are more crucial than ever. Change doesn’t happen in isolation. It happens when communities speak up, when students and citizens demand better, and when the next generation of leaders refuses to settle for corporate promises alone. Petitioning for faster timelines, greater transparency, and more accountability can help accelerate Tata’s transition and ensure the company is not just reacting to crisis, but proactively protecting communities.</p>
            <p>The opportunity for change is real. Tata is beginning to move in the right direction—but the pace and scope of change must match the urgency of the harm already done. As a young person living in the Netherlands, your voice matters. You can help deliver a better, safer, and healthier world not only for yourself, but for future generations. Join the movement to hold Tata accountable—not just to their stated goals, but to the people who live in the shadow of their smokestacks every day.</p>
            <div class="bibliography">
                <h3>Bibliography</h3>
                <ul>
                    <li>Tata Steel Nederland. (n.d.). Sustainability. Retrieved May 16, 2025, from https://www.tatasteelnederland.com/en/sustainability</li>
                    <li>Tata Steel Nederland. (n.d.). Measures - Roadmap Plus. Retrieved May 16, 2025, from https://www.tatasteelnederland.com/en/sustainability/measures/roadmap-plus/map</li>
                </ul>
            </div>
        `,
        detailedContent_nl: `
            <h1>Tata Steel's Groene Toekomst: Is Het Te Veel, Te Laat?</h1>
            <p>Tata Steel speelt al lange tijd een centrale rol in de Nederlandse industriële sector, met name in IJmuiden, waar zijn activiteiten zowel economische waarde als ernstige milieuproblemen hebben opgeleverd. De laatste jaren is het bedrijf begonnen aan een transitie naar duurzamere praktijken, met ambitieuze doelen om CO2-neutraal te worden. De cruciale vraag blijft echter: komen deze inspanningen te laat, en zijn ze voldoende om de decennialange schade die al is aangericht aan te pakken?</p>
            <p>Tata Steel Nederland heeft zich gecommitteerd aan belangrijke initiatieven voor groen staal. Volgens het bedrijf: “herontwikkelen we het hart van ons productieproces en gaan we staal maken op basis van waterstof. We verwachten hiermee de CO2-uitstoot met 35 tot 40% te verminderen in 2030. Ons doel is om in 2045 volledig CO2-neutraal staal te produceren” (Tata Steel Nederland). Deze verschuiving naar staalproductie op basis van waterstof weerspiegelt bredere trends in de Europese staalindustrie, waar andere bedrijven zoals SSAB en Ovako al vooroplopen met fossielvrije staalproductietechnologieën.</p>
            <p>Naast hun langetermijndoelen lanceerde Tata ook de “Roadmap Plus,” een reeks milieumaatregelen die tegen 2025 voltooid moeten zijn. Deze maatregelen zijn gericht op het verminderen van vervuiling en het verbeteren van de lokale leefomgeving voor inwoners van de IJmond en omliggende gebieden. Zoals vermeld op hun site: “via de maatregelen uit de Roadmap Plus werken we ook aan een betere leefomgeving” (Tata Roadmap Plus).</p>
            <p>Hoewel deze ontwikkelingen op papier veelbelovend zijn, stellen veel critici dat ze pas zijn gekomen als reactie op toenemende publieke druk. Pas na jaren van protesten en groeiende gezondheidszorgen vanuit lokale gemeenschappen begon Tata Steel zijn groene transitie te versnellen. Het milieuregistratie van het bedrijf in het verleden, gekenmerkt door vervuilingsincidenten en toezicht door regelgevende instanties, heeft geleid tot diepgewortelde scepsis onder bewoners. Zij vragen zich af of de huidige plannen echt worden gedreven door een commitment aan duurzaamheid of slechts een public relations-oefening zijn om critici tevreden te stellen en aan regelgeving te voldoen.</p>
            <p>Bovendien wordt de tijdlijn voor het bereiken van CO2-neutraliteit tegen 2045 door sommigen als te traag beschouwd, gezien de urgentie van de klimaatcrisis en de onmiddellijke gezondheidseffecten op de omliggende gemeenschappen. De Europese Unie streeft naar klimaatneutraliteit tegen 2050, en veel milieugroeperingen pleiten voor nog snellere transities. De vraag is of Tata Steel snel genoeg kan en zal handelen om een betekenisvol verschil te maken voordat onomkeerbare schade is aangericht.</p>
            <p>De uitdaging is immens. Het ombouwen van een volledige staalfabriek naar productie op basis van waterstof vereist enorme investeringen, technologische innovatie en een complete herziening van de bestaande infrastructuur. Het hangt ook af van de beschikbaarheid van groene waterstof, wat zelf een ontwikkelende industrie is. Hoewel de toezegging van Tata Steel een stap in de goede richting is, is de weg naar een echt groene toekomst bezaaid met obstakels en onzekerheden.</p>
            <p>Uiteindelijk zal het succes van Tata Steel's groene transitie niet alleen worden beoordeeld op zijn CO2-reductiedoelstellingen, maar ook op de tastbare impact op de gezondheid en het welzijn van de IJmond-gemeenschap en het milieu. Het vereist transparantie, verantwoordingsplicht en een oprecht partnerschap met lokale belanghebbenden. Is het te veel, te laat? Alleen de tijd zal het leren, maar de belangen kunnen niet hoger zijn.</p>
            <div class="bibliography">
                <h3>Bibliografie</h3>
                <ul>
                    <li>Tata Steel Nederland. (z.d.). Groen Staal. Geraadpleegd op 16 mei 2025, van https://www.tatasteelnederland.com/groen-staal</li>
                    <li>Tata Steel Nederland. (z.d.). Roadmap Plus. Geraadpleegd op 16 mei 2025, van https://www.tatasteelnederland.com/roadmap-plus</li>
                </ul>
            </div>
        `,
        en: {
            title: "Tata Steel’s Green Future: Is It Too Much, Too Late?",
            subtitle: "Examining Tata Steel's sustainability efforts amidst community concerns.",
            content: "Tata Steel has announced plans for CO2-neutral steel by 2045 and environmental improvements by 2025, but critics question if these efforts are sufficient or timely given past damage.",
            expandedContent: "Tata Steel has long played a central role in the Netherlands' industrial sector, particularly in IJmuiden, where its operations have brought both economic value and serious environmental concerns. In recent years, the company has begun a transition toward more sustainable practices, with ambitious goals for becoming CO2-neutral. However, the critical question remains: are these efforts arriving too late, and are they enough to address the decades of damage already done?\n\nTata Steel Nederland has committed to significant green steel initiatives. According to the company, “we are redeveloping the very heart of our production process and will be making steel based on hydrogen. We expect this to reduce CO2 emissions by 35 to 40% by 2030. Our goal is to produce completely CO2-neutral steel by 2045” (Tata Steel Nederland). This shift toward hydrogen-based steel production mirrors broader trends in the European steel industry, where other companies like SSAB and Ovako are already leading the way with fossil-free steelmaking technologies.\n\nIn addition to their long-term goals, Tata also launched the “Roadmap Plus,” a set of environmental measures set to be completed by 2025. These measures aim to reduce pollution and improve the local living environment for residents of IJmond and surrounding areas. As stated on their site, “through the measures from the Roadmap Plus, we are also working on a better living environment” (Tata Roadmap Plus).\n\nWhile these developments are promising on paper, many critics argue they have only come in response to mounting public pressure. It wasn’t until repeated reports of graphite rain, elevated cancer risks, and environmental degradation in the region that Tata began seriously implementing green initiatives. In that sense, Tata’s sustainability push can feel more like damage control than visionary leadership.\n\nThat’s why public voices—especially those of younger generations—are more crucial than ever. Change doesn’t happen in isolation. It happens when communities speak up, when students and citizens demand better, and when the next generation of leaders refuses to settle for corporate promises alone. Petitioning for faster timelines, greater transparency, and more accountability can help accelerate Tata’s transition and ensure the company is not just reacting to crisis, but proactively protecting communities.\n\nThe opportunity for change is real. Tata is beginning to move in the right direction—but the pace and scope of change must match the urgency of the harm already done. As a young person living in the Netherlands, your voice matters. You can help deliver a better, safer, and healthier world not only for yourself, but for future generations. Join the movement to hold Tata accountable—not just to their stated goals, but to the people who live in the shadow of their smokestacks every day."
        },
        nl: {
            title: "Tata Steel's Groene Toekomst: Is Het Te Veel, Te Laat?",
            subtitle: "Een onderzoek naar Tata Steel's duurzaamheidsinspanningen te midden van zorgen vanuit de gemeenschap.",
            content: "Tata Steel streeft naar CO2-neutraliteit in 2045 met groene staalinitiatieven, maar stuit op scepsis en urgentie vanwege vervuiling en gezondheidseffecten in het verleden.",
            expandedContent: "Tata Steel streeft naar CO2-neutraliteit in 2045 met groene staalinitiatieven, maar stuit op scepsis en urgentie vanwege vervuiling en gezondheidseffecten in het verleden. De transitie omvat productie op basis van waterstof en de Roadmap Plus voor onmiddellijke vervuilingsreductie, toch blijven het vertrouwen van de gemeenschap en de snelheid van verandering cruciale aandachtspunten."
        },
        iconSVG: `<svg class="icon-tata" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4,4H20V20H4V4Z" stroke-width="2" fill="none" stroke="#f47a23" /><path d="M8,8V16" stroke-width="2" stroke="#10afef" /><path d="M12,8V16" stroke-width="2" stroke="#10afef" /><path d="M16,8V16" stroke-width="2" stroke="#10afef" /><path d="M8,8H16" stroke-width="2" stroke="#10afef" /><path d="M8,12H16" stroke-width="2" stroke="#10afef" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-tata.jpg',
    },
    {
        name: "Hospital", 
        start: 70, end: 75, 
        detailedContent_en: `<h1>Health Consequences</h1><h2>Cognitive and developmental harm in children</h2><p>– Exposure to lead, manganese, and other heavy metals linked to reduced IQ, learning disabilities, and behavioral issues.<br><em>(RIVM, 2022; Environmental Health Perspectives, 2012; Lancet Planetary Health, 2021)</em></p><h2>Higher cancer risk</h2><p>– Especially lung, bladder, and skin cancer due to polycyclic aromatic hydrocarbons (PAHs), chromium-6, and benzene.<br><em>(Milieudefensie, n.d.; RIVM, 2023)</em></p><h2>Respiratory issues</h2><p>– Chronic bronchitis, asthma, and decreased lung function caused by fine particulate matter (PM2.5, PM10) and other emissions.<br><em>(TNO, n.d.; WHO, 2013; GGD Kennemerland, n.d.)</em></p><h2>Cardiovascular problems</h2><p>– Fine particulates increase the risk of heart attacks, strokes, and high blood pressure.<br><em>(WHO, 2013; TNO, n.d.)</em></p><h2>Mental health stress and anxiety</h2><p>– Youth report feeling ignored, powerless, and worried about long-term health due to exposure.<br><em>(Youth Without Representation, 2023; Tata Saga, 2022)</em></p><h2>Disproportionate impact on youth</h2><p>– Lack of civic channels for youth to respond, despite being most affected.<br><em>(Youth Without Representation, 2023; Focus Group Transcripts, 2024)</em></p><h2>Bibliography</h2><ul><li>Environmental Health Perspectives. (2012). Lead exposure and child behavior. National Institute of Environmental Health Sciences. <a href="https://ehp.niehs.nih.gov" target="_blank">https://ehp.niehs.nih.gov</a></li><li>GGD Kennemerland. (n.d.). Gezondheid en milieu rond Tata Steel. <a href="https://www.ggdkennemerland.nl" target="_blank">https://www.ggdkennemerland.nl</a></li><li>Lancet Planetary Health. (2021). Air pollution and child cognitive development: A global perspective. <a href="https://www.thelancet.com/journals/lanplh" target="_blank">https://www.thelancet.com/journals/lanplh</a></li><li>Milieudefensie. (n.d.). Tata Steel: De vieze feiten. <a href="https://milieudefensie.nl" target="_blank">https://milieudefensie.nl</a></li><li>National Institute for Public Health and the Environment (RIVM). (2022). Gezondheidsonderzoek Wijk aan Zee: Inventarisatie gezondheidseffecten bij kinderen. <a href="https://www.rivm.nl" target="_blank">https://www.rivm.nl</a></li><li>National Institute for Public Health and the Environment (RIVM). (2023). Emissies Tata Steel en gezondheidsrisico's. <a href="https://www.rivm.nl" target="_blank">https://www.rivm.nl</a></li><li>TNO. (n.d.). Luchtkwaliteit rond Tata Steel: effect op gezondheid. <a href="https://www.tno.nl" target="_blank">https://www.tno.nl</a></li><li>The Tata Saga. (2022). Follow the Money: Tata Steel’s toxic legacy. <a href="https://www.ftm.nl" target="_blank">https://www.ftm.nl</a></li><li>World Health Organization. (2013). Health effects of particulate matter: Policy implications for countries in eastern Europe, Caucasus and central Asia. <a href="https://www.who.int" target="_blank">https://www.who.int</a></li><li>Youth Without Representation. (2023). Internal memo on youth participation and environmental health. University of Amsterdam.</li><li>Focus Group Transcripts. (2025). Participatory insights on Tata Steel and health. Internal project data, University of Amsterdam.</li></ul>`,
        detailedContent_nl: `<h1>Gezondheidsgevolgen</h1><h2>Cognitieve en ontwikkelingsschade bij kinderen</h2><p>– Blootstelling aan lood, mangaan en andere zware metalen gekoppeld aan verlaagd IQ, leerstoornissen en gedragsproblemen.<br><em>(RIVM, 2022; Environmental Health Perspectives, 2012; Lancet Planetary Health, 2021)</em></p><h2>Hoger kankerrisico</h2><p>– Vooral long-, blaas- en huidkanker door polycyclische aromatische koolwaterstoffen (PAK\'s), chroom-6 en benzeen.<br><em>(Milieudefensie, n.d.; RIVM, 2023)</em></p><h2>Luchtwegproblemen</h2><p>– Chronische bronchitis, astma en verminderde longfunctie veroorzaakt door fijnstof (PM2.5, PM10) en andere emissies.<br><em>(TNO, n.d.; WHO, 2013; GGD Kennemerland, n.d.)</em></p><h2>Hart- en vaatziekten</h2><p>– Fijnstof verhoogt het risico op hartaanvallen, beroertes en hoge bloeddruk.<br><em>(WHO, 2013; TNO, n.d.)</em></p><h2>Mentale gezondheid stress en angst</h2><p>– Jongeren melden zich genegeerd, machteloos en bezorgd te voelen over de langetermijngezondheid als gevolg van blootstelling.<br><em>(Youth Without Representation, 2023; Tata Saga, 2022)</em></p><h2>Onevenredige impact op jongeren</h2><p>– Gebrek aan maatschappelijke kanalen voor jongeren om te reageren, ondanks dat zij het zwaarst getroffen zijn.<br><em>(Youth Without Representation, 2023; Focus Group Transcripts, 2024)</em></p><h2>Bibliografie</h2><ul><li>Environmental Health Perspectives. (2012). Lead exposure and child behavior. National Institute of Environmental Health Sciences. <a href="https://ehp.niehs.nih.gov" target="_blank">https://ehp.niehs.nih.gov</a></li><li>GGD Kennemerland. (n.d.). Gezondheid en milieu rond Tata Steel. <a href="https://www.ggdkennemerland.nl" target="_blank">https://www.ggdkennemerland.nl</a></li><li>Lancet Planetary Health. (2021). Air pollution and child cognitive development: A global perspective. <a href="https://www.thelancet.com/journals/lanplh" target="_blank">https://www.thelancet.com/journals/lanplh</a></li><li>Milieudefensie. (n.d.). Tata Steel: De vieze feiten. <a href="https://milieudefensie.nl" target="_blank">https://milieudefensie.nl</a></li><li>National Institute for Public Health and the Environment (RIVM). (2022). Gezondheidsonderzoek Wijk aan Zee: Inventarisatie gezondheidseffecten bij kinderen. <a href="https://www.rivm.nl" target="_blank">https://www.rivm.nl</a></li><li>National Institute for Public Health and the Environment (RIVM). (2023). Emissies Tata Steel en gezondheidsrisico's. <a href="https://www.rivm.nl" target="_blank">https://www.rivm.nl</a></li><li>TNO. (n.d.). Luchtkwaliteit rond Tata Steel: effect op gezondheid. <a href="https://www.tno.nl" target="_blank">https://www.tno.nl</a></li><li>The Tata Saga. (2022). Follow the Money: Tata Steel’s toxic legacy. <a href="https://www.ftm.nl" target="_blank">https://www.ftm.nl</a></li><li>World Health Organization. (2013). Health effects of particulate matter: Policy implications for countries in eastern Europe, Caucasus and central Asia. <a href="https://www.who.int" target="_blank">https://www.who.int</a></li><li>Youth Without Representation. (2023). Internal memo on youth participation and environmental health. University of Amsterdam.</li><li>Focus Group Transcripts. (2025). Participatory insights on Tata Steel and health. Internal project data, University of Amsterdam.</li></ul>`,
        en: { 
            title: "Health Impacts", 
            subtitle: "The consequences of living near a steel factory.", 
            content: "Living near Tata Steel is linked to severe health issues. Studies show increased carcinogens, heavy metals, and related illnesses in the IJmond region.", 
            expandedContent: "The RIVM found carcinogenic substances in Wijk aan Zee increased up to fourfold in a year, with significantly higher lead levels. Pollution in nearby areas is often twice as high, and up to five times higher near the Tata site. The primary pollutants, PAHs, are known to cause cancer and damage eyes, liver, and kidneys by altering DNA. Professor Onno van Schayck highlights the long-known dangers: 'We already knew 50 years ago that these substances are carcinogenic.' He warns, 'People are dying here,' condemning the ongoing failure to act as 'negligent.'"
        },
        nl: { title: "Gezondheidsgevolgen", subtitle: "De consequenties van wonen nabij een staalfabriek.", content: "Gedetailleerde informatie over gezondheidsstudies en lokale zorgen.", expandedContent: "Studies hebben correlaties aangetoond tussen de nabijheid van staalfabrieken en een toename van ademhalingsproblemen, evenals zorgen over langdurige blootstelling aan fijnstof en zware metalen. Dit gedeelte onderzoekt de beschikbare gegevens en rapporten over de gezondheid van de gemeenschap." },
        iconSVG: `<svg class="icon-hospital" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6H6V18H18V6Z" stroke-width="2" fill="none" stroke="#E74C3C" /><path d="M12 9V15M9 12H15" stroke-width="2" stroke="#E74C3C" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-hospital.jpg',
    },
    {
        name: "Plane", start: 75, end: 81, 
        detailedContent_en: `
            <h1>Two Futures: IJmond's Crossroads</h1>
            <h2>The Pittsburgh Precedent</h2>
            <p>Much like Tata Steel in IJmond, Pittsburgh, Pennsylvania, too had a coke plant called Shenango Coke Works which closed down in 2016. There was soot everywhere and people living nearby could smell it, and noticed that is was hard to breathe.</p>
            <p style="text-align: center;"><img src="images/shenangoworks.jpg" alt="Shenango Coke Works plant" style="max-width: 100%; height: auto;"></p>
            <p>After it closed down research at NYU saw an opportunity to see if reduced air pollution resulting from the closure could mean improved health for people living close by. The air quality improved after steel production halted. Levels of particulate matter and sulfur dioxide dropped significantly, allowing residents to breathe better. What they found was a 42 percent decrease in emergency room visits for cardiovascular disease among nearby residents. And over three years, they dropped even further to 61 percent.</p>
            <p>The Pittsburgh case is very similar to what is happening in the Netherlands in IJmond right now with Tata Steel. Where Pittsburgh gained public health and environmental quality, IJmond continues to suffer. The government and policymakers need to take the steps to protect the health of all Dutch residents instead of putting the economy first. If they do this the public healths can improve so much and it would improve the environment.</p>
            <p>Act now, before more lives are at stake.</p>

            <h2>The Swedish Model for Green Steel</h2>
            <p>As Tata Steel faces growing criticism for its impact on IJmond’s air quality, there is an urgent need to reimagine what’s possible in the steel industry. One of the clearest examples of success comes from Sweden, where companies are leading the green steel revolution. At the forefront is SSAB, one of Europe’s largest steel manufacturers, which is actively phasing out fossil fuels from its production process to become fully carbon-neutral by 2030.</p>
            <p>SSAB is setting a global precedent by eliminating coal from its steel production—a traditional component in blast furnaces—replacing it with hydrogen made using renewable energy. This transition not only reduces CO₂ emissions to near zero, but also saves money in the long run. In the European Union, polluters must pay a carbon fee for every ton of CO₂ they emit. By becoming carbon neutral, SSAB avoids hundreds of euros per ton in carbon penalties. This cost-efficiency proves that innovation in sustainability isn’t just good for public health and the planet—it’s also a sound financial decision.</p>
            <p>Another trailblazer in Sweden is Ovako, a steel company that, in 2023, launched the world’s first fossil-free hydrogen-powered steel heating plant in Hofors. This project began in March 2020, and has become a landmark in sustainable steel production. Ovako’s hydrogen is produced on-site using renewable electricity from hydropower and wind parks, allowing the company to cut emissions from heating processes by up to 80% (Ovako, 2023). In IJmond, a similar reduction in emissions would drastically lower the release of carcinogenic particulates and heavy metals, which have been linked to serious health consequences in the surrounding communities.</p>
            <p style="text-align: center;"><img src="images/swedishfactory.jpeg.jpg" alt="Swedish green steel factory" style="max-width: 100%; height: auto;"></p>
            <p>Ovako’s success demonstrates that hydrogen-based steel heating is technically feasible and economically scalable, and it stands as a viable model for Tata Steel to follow. The transition requires investment, but the long-term savings—through avoided carbon fines and improved energy efficiency—can outweigh the upfront costs.</p>
            <p>Both SSAB and Ovako are also part of HYBRIT, a pioneering joint venture with Vattenfall (energy) and LKAB (mining), which aims to launch the first fully fossil-free green steel plant by 2026. HYBRIT is not just about one company—it’s about a national-level commitment to decarbonizing an entire industry. Its influence has already extended globally, inspiring green steel initiatives in Japan, France, and Germany (Mining Technology, 2023).</p>
            <p>For IJmond, this shows that using public pressure to demand accountability and sustainable innovation can create real change. Sweden’s experience proves that the tools to clean up the steel industry already exist. It’s not a question of technology—it’s a question of will.</p>
            <div class="bibliography">
                <h3>Bibliography (Swedish Model)</h3>
                <ul>
                    <li>Ovako. (2023). World’s first fossil-free hydrogen plant for steel heating. Retrieved from https://www.ovako.com/en/about-ovako/worlds-first-fossil-free-hydrogen-plant-for-steel-heating/#:~:text=Hydrogen%20plant%20makes%20Ovako%20unique,potential%20for%20major%20emission%20reductions.</li>
                    <li>Mining Technology. (2023). Green steel and hydrogen: An industrial revolution in the making. Retrieved from https://www.mining-technology.com/news/green-steel-hydrogen/</li>
                    <li>Volvo Group. (2023). Green steel collaboration. Retrieved from https://www.volvogroup.com/en/sustainable-transportation/sustainable-solutions/green-steel-collaboration.html</li>
                </ul>
            </div>
        `,
        detailedContent_nl: `
            <h1>Twee Toekomsten: Het Kruispunt van de IJmond</h1>
            <h2>Het Precedent van Pittsburgh</h2>
            <p>Net als Tata Steel in de IJmond, had Pittsburgh, Pennsylvania, ook een cokesfabriek genaamd Shenango Coke Works die in 2016 sloot. Overal lag roet en mensen die in de buurt woonden, konden het ruiken en merkten dat het moeilijk was om te ademen.</p>
            <p style="text-align: center;"><img src="images/shenangoworks.jpg" alt="Shenango Coke Works fabriek" style="max-width: 100%; height: auto;"></p>
            <p>Nadat de fabriek sloot, zag onderzoek aan de NYU een kans om te onderzoeken of verminderde luchtvervuiling als gevolg van de sluiting kon leiden tot een betere gezondheid voor de omwonenden. De luchtkwaliteit verbeterde nadat de staalproductie stopte. De niveaus van fijnstof en zwaveldioxide daalden aanzienlijk, waardoor bewoners beter konden ademen. Wat ze vonden was een daling van 42 procent in spoedeisende hulpbezoeken voor hart- en vaatziekten onder nabijgelegen bewoners. En over drie jaar daalden deze zelfs verder tot 61 procent.</p>
            <p>De casus Pittsburgh lijkt sterk op wat er nu in Nederland in de IJmond gebeurt met Tata Steel. Waar Pittsburgh volksgezondheid en milieukwaliteit won, blijft de IJmond lijden. De overheid en beleidsmakers moeten stappen ondernemen om de gezondheid van alle Nederlandse inwoners te beschermen in plaats van de economie voorop te stellen. Als ze dit doen, kan de volksgezondheid enorm verbeteren en zou het milieu er ook beter van worden.</p>
            <p>Kom nu in actie, voordat er meer levens op het spel staan.</p>

            <h2>Het Zweedse Model voor Groen Staal</h2>
            <p>Nu Tata Steel steeds meer kritiek krijgt vanwege de impact op de luchtkwaliteit in de IJmond, is er een dringende behoefte om opnieuw te bedenken wat mogelijk is in de staalindustrie. Een van de duidelijkste succesvoorbeelden komt uit Zweden, waar bedrijven de revolutie van groen staal leiden. Voorop loopt SSAB, een van Europa's grootste staalfabrikanten, die actief fossiele brandstoffen uitfaseert uit haar productieproces om tegen 2030 volledig CO₂-neutraal te zijn.</p>
            <p>SSAB zet een wereldwijd precedent door steenkool – een traditioneel onderdeel in hoogovens – uit haar staalproductie te elimineren en te vervangen door waterstof geproduceerd met hernieuwbare energie. Deze overgang vermindert niet alleen de CO₂-uitstoot tot bijna nul, maar bespaart op de lange termijn ook geld. In de Europese Unie moeten vervuilers een koolstofheffing betalen voor elke ton CO₂ die ze uitstoten. Door CO₂-neutraal te worden, vermijdt SSAB honderden euro's per ton aan koolstofboetes. Deze kostenefficiëntie bewijst dat innovatie in duurzaamheid niet alleen goed is voor de volksgezondheid en de planeet, maar ook een gezonde financiële beslissing.</p>
            <p>Een andere pionier in Zweden is Ovako, een staalbedrijf dat in 2023 's werelds eerste fossielvrije, waterstof-aangedreven staalverwarmingsinstallatie in Hofors lanceerde. Dit project begon in maart 2020, en is een mijlpaal geworden in duurzame staalproductie. Ovako's waterstof wordt ter plaatse geproduceerd met hernieuwbare elektriciteit uit waterkracht en windparken, waardoor het bedrijf de uitstoot van verwarmingsprocessen tot 80% kan verminderen (Ovako, 2023). In de IJmond zou een vergelijkbare emissiereductie de uitstoot van kankerverwekkende deeltjes en zware metalen, die in verband zijn gebracht met ernstige gezondheidsgevolgen in de omliggende gemeenschappen, drastisch verlagen.</p>
            <p style="text-align: center;"><img src="images/swedishfactory.jpeg.jpg" alt="Zweedse groene staalfabriek" style="max-width: 100%; height: auto;"></p>
            <p>Ovako's succes toont aan dat waterstof-gebaseerde staalverwarming technisch haalbaar en economisch schaalbaar is, en het staat als een levensvatbaar model voor Tata Steel om te volgen. De overgang vereist investeringen, maar de langetermijnbesparingen – door vermeden koolstofboetes en verbeterde energie-efficiëntie – kunnen de initiële kosten overtreffen.</p>
            <p>Both SSAB and Ovako are also part of HYBRIT, a pioneering joint venture with Vattenfall (energy) and LKAB (mining), which aims to launch the first fully fossil-free green steel plant by 2026. HYBRIT is not just about one company—it’s about a national-level commitment to decarbonizing an entire industry. Its influence has already extended globally, inspiring green steel initiatives in Japan, France, and Germany (Mining Technology, 2023).</p>
            <p>For IJmond, this shows that using public pressure to demand accountability and sustainable innovation can create real change. Sweden’s experience proves that the tools to clean up the steel industry already exist. It’s not a question of technology—it’s a question of will.</p>
            <div class="bibliography">
                <h3>Bibliografie (Zweeds Model)</h3>
                <ul>
                    <li>Ovako. (2023). World’s first fossil-free hydrogen plant for steel heating. Geraadpleegd van https://www.ovako.com/en/about-ovako/worlds-first-fossil-free-hydrogen-plant-for-steel-heating/#:~:text=Hydrogen%20plant%20makes%20Ovako%20unique,potential%20for%20major%20emission%20reductions.</li>
                    <li>Mining Technology. (2023). Green steel and hydrogen: An industrial revolution in the making. Geraadpleegd van https://www.mining-technology.com/news/green-steel-hydrogen/</li>
                    <li>Volvo Group. (2023). Green steel collaboration. Geraadpleegd van https://www.volvogroup.com/en/sustainable-transportation/sustainable-solutions/green-steel-collaboration.html</li>
                </ul>
            </div>
        `,
        en: { 
            title: "Two Futures: IJmond's Crossroads", 
            subtitle: "Lessons from Pittsburgh's closure and Sweden's green steel innovation.", 
            content: "IJmond stands at a crossroads, learning from Pittsburgh's post-industrial health recovery and Sweden's pioneering green steel technologies. These examples offer paths towards a healthier environment and a sustainable industrial future.", 
            expandedContent: "**The Pittsburgh Precedent:**\nMuch like Tata Steel in IJmond, Pittsburgh, Pennsylvania, too had a coke plant called Shenango Coke Works which closed down in 2016. There was soot everywhere and people living nearby could smell it, and noticed that is was hard to breathe.\n\nAfter it closed down research at NYU saw an opportunity to see if reduced air pollution resulting from the closure could mean improved health for people living close by. The air quality improved after steel production halted. Levels of particulate matter and sulfur dioxide dropped significantly, allowing residents to breathe better. What they found was a 42 percent decrease in emergency room visits for cardiovascular disease among nearby residents. And over three years, they dropped even further to 61 percent.\n\nThe Pittsburgh case is very similar to what is happening in the Netherlands in IJmond right now with Tata Steel. Where Pittsburgh gained public health and environmental quality, IJmond continues to suffer. The government and policymakers need to take the steps to protect the health of all Dutch residents instead of putting the economy first. If they do this the public healths can improve so much and it would improve the environment.\n\nAct now, before more lives are at stake.\n\n**The Swedish Model for Green Steel:**\nAs Tata Steel faces growing criticism for its impact on IJmond’s air quality, there is an urgent need to reimagine what’s possible in the steel industry. One of the clearest examples of success comes from Sweden, where companies are leading the green steel revolution. At the forefront is SSAB, one of Europe’s largest steel manufacturers, which is actively phasing out fossil fuels from its production process to become fully carbon-neutral by 2030.\n\nSSAB is setting a global precedent by eliminating coal from its steel production—a traditional component in blast furnaces—replacing it with hydrogen made using renewable energy. This transition not only reduces CO₂ emissions to near zero, but also saves money in the long run. In the European Union, polluters must pay a carbon fee for every ton of CO₂ they emit. By becoming carbon neutral, SSAB avoids hundreds of euros per ton in carbon penalties. This cost-efficiency proves that innovation in sustainability isn’t just good for public health and the planet—it’s also a sound financial decision.\n\nAnother trailblazer in Sweden is Ovako, a steel company that, in 2023, launched the world’s first fossil-free hydrogen-powered steel heating plant in Hofors. This project began in March 2020, and has become a landmark in sustainable steel production. Ovako’s hydrogen is produced on-site using renewable electricity from hydropower and wind parks, allowing the company to cut emissions from heating processes by up to 80% (Ovako, 2023). In IJmond, a similar reduction in emissions would drastically lower the release of carcinogenic particulates and heavy metals, which have been linked to serious health consequences in the surrounding communities.\n\nOvako’s success demonstrates that hydrogen-based steel heating is technically feasible and economically scalable, and it stands as a viable model for Tata Steel to follow. The transition requires investment, but the long-term savings—through avoided carbon fines and improved energy efficiency—can outweigh the upfront costs.\n\nBoth SSAB and Ovako are also part of HYBRIT, a pioneering joint venture with Vattenfall (energy) and LKAB (mining), which aims to launch the first fully fossil-free green steel plant by 2026. HYBRIT is not just about one company—it’s about a national-level commitment to decarbonizing an entire industry. Its influence has already extended globally, inspiring green steel initiatives in Japan, France, and Germany (Mining Technology, 2023).\n\nFor IJmond, this shows that using public pressure to demand accountability and sustainable innovation can create real change. Sweden’s experience proves that the tools to clean up the steel industry already exist. It’s not a question of technology—it’s a question of will."
        },
        nl: { 
            title: "Twee Toekomsten: Het Kruispunt van de IJmond", 
            subtitle: "Lessen uit het precedent van Pittsburgh en de groene staalinnovatie van Zweden.", 
            content: "De IJmond staat op een kruispunt en leert van het postindustriële gezondheidsherstel van Pittsburgh en de baanbrekende groene staaltechnologieën van Zweden. Deze voorbeelden bieden wegen naar een gezonder milieu en een duurzame industriële toekomst.", 
            expandedContent: "Net als Tata Steel in de IJmond, had Pittsburgh, Pennsylvania, ook een cokesfabriek genaamd Shenango Coke Works die in 2016 sloot. Overal lag roet en mensen die in de buurt woonden, konden het ruiken en merkten dat het moeilijk was om te ademen.\n\nNadat de fabriek sloot, zag onderzoek aan de NYU een kans om te onderzoeken of verminderde luchtvervuiling als gevolg van de sluiting kon leiden tot een betere gezondheid voor de omwonenden. De luchtkwaliteit verbeterde nadat de staalproductie stopte. De niveaus van fijnstof en zwaveldioxide daalden aanzienlijk, waardoor bewoners beter konden ademen. Wat ze vonden was een daling van 42 procent in spoedeisende hulpbezoeken voor hart- en vaatziekten onder nabijgelegen bewoners. En over drie jaar daalden deze zelfs verder tot 61 procent.\n\nDe casus Pittsburgh lijkt sterk op wat er nu in Nederland in de IJmond gebeurt met Tata Steel. Waar Pittsburgh volksgezondheid en milieukwaliteit won, blijft de IJmond lijden. De overheid en beleidsmakers moeten stappen ondernemen om de gezondheid van alle Nederlandse inwoners te beschermen in plaats van de economie voorop te stellen. Als ze dit doen, kan de volksgezondheid enorm verbeteren en zou het milieu er ook beter van worden.\n\nKom nu in actie, voordat er meer levens op het spel staan.\n\nNu Tata Steel steeds meer kritiek krijgt vanwege de impact op de luchtkwaliteit in de IJmond, is er een dringende behoefte om opnieuw te bedenken wat mogelijk is in de staalindustrie. Een van de duidelijkste succesvoorbeelden komt uit Zweden, waar bedrijven de revolutie van groen staal leiden. Voorop loopt SSAB, een van Europa's grootste staalfabrikanten, die actief fossiele brandstoffen uitfaseert uit haar productieproces om tegen 2030 volledig CO₂-neutraal te zijn.\n\nSSAB zet een wereldwijd precedent door steenkool – een traditioneel onderdeel in hoogovens – uit haar staalproductie te elimineren en te vervangen door waterstof geproduceerd met hernieuwbare energie. Deze overgang vermindert niet alleen de CO₂-uitstoot tot bijna nul, maar bespaart op de lange termijn ook geld. In de Europese Unie moeten vervuilers een koolstofheffing betalen voor elke ton CO₂ die ze uitstoten. Door CO₂-neutraal te worden, vermijdt SSAB honderden euro's per ton aan koolstofboetes. Deze kostenefficiëntie bewijst dat innovatie in duurzaamheid niet alleen goed is voor de volksgezondheid en de planeet, maar ook een gezonde financiële beslissing.\n\nEen andere pionier in Zweden is Ovako, een staalbedrijf dat in 2023 's werelds eerste fossielvrije, waterstof-aangedreven staalverwarmingsinstallatie in Hofors lanceerde. Dit project begon in maart 2020, en is een mijlpaal geworden in duurzame staalproductie. Ovako's waterstof wordt ter plaatse geproduceerd met hernieuwbare elektriciteit uit waterkracht en windparken, waardoor het bedrijf de uitstoot van verwarmingsprocessen tot 80% kan verminderen (Ovako, 2023). In de IJmond zou een vergelijkbare emissiereductie de uitstoot van kankerverwekkende deeltjes en zware metalen, die in verband zijn gebracht met ernstige gezondheidsgevolgen in de omliggende gemeenschappen, drastisch verlagen.\n\nOvako's succes toont aan dat waterstof-gebaseerde staalverwarming technisch haalbaar en economisch schaalbaar is, en het staat als een levensvatbaar model voor Tata Steel om te volgen. De overgang vereist investeringen, maar de langetermijnbesparingen – door vermeden koolstofboetes en verbeterde energie-efficiëntie – kunnen de initiële kosten overtreffen.\n\nZowel SSAB als Ovako maken ook deel uit van HYBRIT, een baanbrekende joint venture met Vattenfall (energie) en LKAB (mijnbouw), die tot doel heeft om tegen 2026 de eerste volledig fossielvrije groene staalfabriek te lanceren. HYBRIT is niet alleen over één bedrijf – het gaat over een nationale inzet om een hele industrie koolstofvrij te maken. De invloed ervan heeft zich al wereldwijd uitgebreid en groene staalinitiatieven geïnspireerd in Japan, Frankrijk en Duitsland (Mining Technology, 2023).\n\nVoor de IJmond toont dit aan dat het gebruik van publieke druk om verantwoording en duurzame innovatie te eisen, echte verandering kan teweegbrengen. De ervaring van Zweden bewijst dat de middelen om de staalindustrie op te schonen al bestaan. Het is geen kwestie van technologie – het is een kwestie van wil."
        },
        iconSVG: `<svg class="icon-plane" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,16L14,8L15,3C15,2.4477 13.5523,2 13,2L11,2C10.4477,2 10,2.4477 10,3L10,8L2,16L2,18L10,16L10,21C10,21.5523 10.4477,22 11,22L13,22C13.5523,22 14,21.5523 14,21L14,16L22,18L22,16Z" /></svg>`,
        imageSrc: "https://via.placeholder.com/320x180?text=Transportation+Hub",
        heroImage: 'images/hero-plane.jpg',
    },
    {
        name: "Beach", start: 69, end: 75, 
        detailedContent_en: `
            <h1>The Beach: A Sanctuary Threatened by Pollution</h1>
            <p>The beaches near IJmuiden, such as Wijk aan Zee and Zandvoort, are popular recreational areas, attracting locals and tourists alike for their scenic beauty and opportunities for swimming, surfing, and relaxation. These coastal environments are not only vital for tourism and leisure but also serve as important natural habitats for various marine and avian species.</p>
            <p>However, the proximity of heavy industry, particularly Tata Steel, poses a significant threat to these coastal ecosystems. Industrial runoff, airborne pollutants, and accidental discharges can contaminate beach sands and coastal waters. Studies and local reports have periodically highlighted concerns about the presence of industrial pollutants, including heavy metals and PAHs, in the coastal environment. This pollution can affect marine life, leading to bioaccumulation in the food chain, and can also pose health risks to beachgoers through direct contact or inhalation of contaminated sand or sea spray.</p>
            <p>The challenge lies in balancing industrial activities with the preservation of natural resources and public health. Ongoing monitoring of water and sand quality is crucial, as are stringent regulations and enforcement to minimize industrial emissions and discharges. Community groups and environmental advocates play a vital role in raising awareness and pushing for protective measures to ensure that these cherished beaches remain safe and healthy for both people and wildlife.</p>
            <p>The future of these beaches depends on a collective commitment to sustainable industrial practices and environmental stewardship, ensuring that these natural sanctuaries can be enjoyed by future generations without the looming threat of pollution.</p>
            <div class="bibliography">
                <h3>Bibliography</h3>
                <ul>
                    <li>No specific sources were cited for this general overview, but information can be drawn from reports by RIVM, local news articles on IJmond pollution, and environmental NGOs active in the region.</li>
                </ul>
            </div>
        `,
        detailedContent_nl: `
            <h1>Het Strand: Een Toevluchtsoord Bedreigd door Vervuiling</h1>
            <p>De stranden nabij IJmuiden, zoals Wijk aan Zee en Zandvoort, zijn populaire recreatiegebieden die zowel lokale bewoners als toeristen aantrekken vanwege hun landschappelijke schoonheid en mogelijkheden om te zwemmen, surfen en ontspannen. Deze kustomgevingen zijn niet alleen essentieel voor toerisme en recreatie, maar dienen ook als belangrijke natuurlijke habitats voor diverse mariene en vogelsoorten.</p>
            <p>De nabijheid van zware industrie, met name Tata Steel, vormt echter een aanzienlijke bedreiging voor deze kustecosystemen. Industriële afvoer, luchtverontreinigende stoffen en accidentele lozingen kunnen strandzand en kustwateren vervuilen. Studies en lokale rapporten hebben periodiek gewezen op zorgen over de aanwezigheid van industriële verontreinigende stoffen, waaronder zware metalen en PAK's, in de kustomgeving. Deze vervuiling kan het mariene leven aantasten, leiden tot bioaccumulatie in de voedselketen, en kan ook gezondheidsrisico's voor strandgangers opleveren door direct contact of inademing van vervuild zand of zeespray.</p>
            <p>De uitdaging ligt in het balanceren van industriële activiteiten met het behoud van natuurlijke hulpbronnen en de volksgezondheid. Continue monitoring van de water- en zandkwaliteit is cruciaal, evenals strenge regelgeving en handhaving om industriële emissies en lozingen te minimaliseren. Gemeenschapsgroepen en milieuactivisten spelen een vitale rol bij het vergroten van het bewustzijn en het aandringen op beschermende maatregelen om ervoor te zorgen dat deze gekoesterde stranden veilig en gezond blijven voor zowel mens als dier.</p>
            <p>De toekomst van deze stranden hangt af van een collectieve inzet voor duurzame industriële praktijken en milieubeheer, zodat toekomstige generaties van deze natuurlijke toevluchtsoorden kunnen genieten zonder de dreigende vervuiling.</p>
            <div class="bibliography">
                <h3>Bibliografie</h3>
                <ul>
                    <li>Er zijn geen specifieke bronnen geciteerd voor dit algemene overzicht, maar informatie kan worden ontleend aan rapporten van het RIVM, lokale nieuwsartikelen over vervuiling in de IJmond en milieu-ngo's die actief zijn in de regio.</li>
                </ul>
            </div>
        `,
        en: { 
            title: "The Beach: A Sanctuary Threatened by Pollution", 
            subtitle: "The impact of industrial emissions on coastal ecosystems and recreation.", 
            content: "Beaches near industrial complexes like Tata Steel are threatened by pollution, impacting both marine life and the recreational value of these natural resources.", 
            expandedContent: "The beaches near IJmuiden, such as Wijk aan Zee and Zandvoort, are popular recreational areas, attracting locals and tourists alike for their scenic beauty and opportunities for swimming, surfing, and relaxation. These coastal environments are not only vital for tourism and leisure but also serve as important natural habitats for various marine and avian species.\n\nHowever, the proximity of heavy industry, particularly Tata Steel, poses a significant threat to these coastal ecosystems. Industrial runoff, airborne pollutants, and accidental discharges can contaminate beach sands and coastal waters. Studies and local reports have periodically highlighted concerns about the presence of industrial pollutants, including heavy metals and PAHs, in the coastal environment. This pollution can affect marine life, leading to bioaccumulation in the food chain, and can also pose health risks to beachgoers through direct contact or inhalation of contaminated sand or sea spray.\n\nThe challenge lies in balancing industrial activities with the preservation of natural resources and public health. Ongoing monitoring of water and sand quality is crucial, as are stringent regulations and enforcement to minimize industrial emissions and discharges. Community groups and environmental advocates play a vital role in raising awareness and pushing for protective measures to ensure that these cherished beaches remain safe and healthy for both people and wildlife.\n\nThe future of these beaches depends on a collective commitment to sustainable industrial practices and environmental stewardship, ensuring that these natural sanctuaries can be enjoyed by future generations without the looming threat of pollution."
        },
        nl: { 
            title: "Het Strand: Een Toevluchtsoord Bedreigd door Vervuiling", 
            subtitle: "De impact van industriële uitstoot op kustecosystemen en recreatie.", 
            content: "Stranden in de buurt van industriële complexen zoals Tata Steel worden bedreigd door vervuiling, wat gevolgen heeft voor zowel het mariene leven als de recreatieve waarde van deze natuurlijke hulpbronnen.", 
            expandedContent: "De stranden nabij IJmuiden, zoals Wijk aan Zee en Zandvoort, zijn populaire recreatiegebieden die zowel lokale bewoners als toeristen aantrekken vanwege hun landschappelijke schoonheid en mogelijkheden om te zwemmen, surfen en ontspannen. Deze kustomgevingen zijn niet alleen essentieel voor toerisme en recreatie, maar dienen ook als belangrijke natuurlijke habitats voor diverse mariene en vogelsoorten.\n\nDe nabijheid van zware industrie, met name Tata Steel, vormt echter een aanzienlijke bedreiging voor deze kustecosystemen. Industriële afvoer, luchtverontreinigende stoffen en accidentele lozingen kunnen strandzand en kustwateren vervuilen. Studies en lokale rapporten hebben periodiek gewezen op zorgen over de aanwezigheid van industriële verontreinigende stoffen, waaronder zware metalen en PAK's, in de kustomgeving. Deze vervuiling kan het mariene leven aantasten, leiden tot bioaccumulatie in de voedselketen, en kan ook gezondheidsrisico's voor strandgangers opleveren door direct contact of inademing van vervuild zand of zeespray.\n\nDe uitdaging ligt in het balanceren van industriële activiteiten met het behoud van natuurlijke hulpbronnen en de volksgezondheid. Continue monitoring van de water- en zandkwaliteit is cruciaal, evenals strenge regelgeving en handhaving om industriële emissies en lozingen te minimaliseren. Gemeenschapsgroepen en milieuactivisten spelen een vitale rol bij het vergroten van het bewustzijn en het aandringen op beschermende maatregelen om ervoor te zorgen dat deze gekoesterde stranden veilig en gezond blijven voor zowel mens als dier.\n\nDe toekomst van deze stranden hangt af van een collectieve inzet voor duurzame industriële praktijken en milieubeheer, zodat toekomstige generaties van deze natuurlijke toevluchtsoorden kunnen genieten zonder de dreigende vervuiling."
        },
        iconSVG: `<svg class="icon-beach" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C6.48 2 2 6.48 2 12 C2 17.52 6.48 22 12 22 C17.52 22 22 17.52 22 12 C22 6.48 17.52 2 12 2 Z M12 20 C7.59 20 4 16.41 4 12 C4 7.59 7.59 4 12 4 C16.41 4 20 7.59 20 12 C20 16.41 16.41 20 12 20 Z" fill="#f47a23" /><path d="M10 10 C10 8.9 10.9 8 12 8 S14 8.9 14 10 C14 11.1 13.1 12 12 12 S10 11.1 10 10 Z M6 14 C6 12.9 6.9 12 8 12 S10 12.9 10 14 C10 15.1 9.1 16 8 16 S6 15.1 6 14 Z M14 14 C14 12.9 14.9 12 16 12 S18 12.9 18 14 C18 15.1 17.1 16 16 16 S14 15.1 14 14 Z" /></svg>`,
        imageSrc: null, 
        heroImage: 'images/hero-beach.jpg',
    }
];

export function initSections(_waypoints, _pathCurve, _carModel) {
    waypointsRef = _waypoints;
    pathCurveRef = _pathCurve;
    carModelRef = _carModel;

    // Initially hide or set default text
    if (sectionTextContainer) sectionTextContainer.style.opacity = '0';
    updateSectionTextDisplay(); // Show welcome/default text if applicable

    // Event listeners for the overlay
    if (detailsOverlayClose) {
        detailsOverlayClose.addEventListener('click', hideDetailsOverlay);
    }
    if (detailsOverlay) {
        detailsOverlay.addEventListener('click', (event) => {
            if (event.target === detailsOverlay) { // Clicked on backdrop
                hideDetailsOverlay();
            }
        });
    }
    // Add language change listener for overlay content
    addLanguageChangeListener(updateOverlayLanguage);

    // Event delegation for section header clicks to show details overlay
    if (sectionTextDiv) {
        sectionTextDiv.addEventListener('click', function(event) {
            const header = event.target.closest('.section-header');
            if (header && currentSectionIndex !== -1) {
                const sectionToDisplay = sections[currentSectionIndex];
                if (sectionToDisplay) {
                    showDetailsOverlay(sectionToDisplay);
                }
            }
        });
    }
}

export function checkAndUpdateSection(currentWaypointIdx, lang) {
    let newSectionIndex = -1;
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.start <= section.end) { // Normal range
            if (currentWaypointIdx >= section.start && currentWaypointIdx <= section.end) {
                newSectionIndex = i;
                break;
            }
        } else { // Wrapped range (e.g., end < start, meaning it crosses the 0 index)
            if (currentWaypointIdx >= section.start || currentWaypointIdx <= section.end) {
                newSectionIndex = i;
                break;
            }
        }
    }

    if (newSectionIndex !== currentSectionIndex) {
        currentSectionIndex = newSectionIndex;
        updateSectionTextDisplay();
    }
}

function updateSectionTextDisplay() {
    if (!sectionTextContainer || !sectionTextDiv) return;

    sectionTextDiv.innerHTML = ''; // Explicitly clear previous content

    const lang = getCurrentLanguage();

    if (currentSectionIndex === -1) {
        // Default/Welcome text if not in a specific section
        // This could be the initial state or when between defined zones.
        // For now, let's use a generic welcome or keep it hidden.
        // To keep it hidden:
        sectionTextContainer.style.opacity = '0';
        sectionTextDiv.classList.remove('expanded'); // Ensure it's collapsed
        return;
    }
    
    const section = sections[currentSectionIndex];
    const content = section[lang]; // Get language-specific content
    
    let mediaHTML = '';
    if (section.imageSrc) {
        mediaHTML = `
            <div class="section-media section-media-${section.name.toLowerCase()}">
                ${section.iconSVG || ''} <!-- Display icon in media section as well -->
                <div class="section-media-title">${content.title}</div>
                <!-- <img src="${section.imageSrc}" alt="${content.title}"> --> <!-- Image itself can be background or prominent -->
            </div>
        `;
         // If image is placeholder, use title
        if (section.imageSrc.includes('via.placeholder.com')) {
            // The placeholder text is already in the URL
        } else {
             mediaHTML = `
                <div class="section-media">
                    <img src="${section.imageSrc}" alt="${content.title}">
                </div>`;
        }
    } else if (section.videoSrc) {
        mediaHTML = `
            <div class="section-media">
                <video controls width="100%"><source src="${section.videoSrc}" type="video/mp4">Your browser does not support video.</video>
            </div>`;
    }

    sectionTextDiv.innerHTML = `
        <div class="section-header">
            <div class="section-icon">${section.iconSVG}</div>
            <div class="section-header-text">
                <div class="section-title">${content.title}</div>
                <div class="section-subtitle">${content.subtitle}</div>
            </div>
        </div>
        <div class="section-content">
            <div class="section-content-inner">
                ${mediaHTML}
            </div>
        </div>
    `;

    sectionTextContainer.style.opacity = '1';
    sectionTextDiv.classList.remove('expanded'); // Start collapsed

    // Click listener for section header is now handled by event delegation in initSections.
}

function showDetailsOverlay(section) {
    const overlay = document.getElementById('details-overlay');
    const overlayContentElement = document.getElementById('details-overlay-content'); // Correct target for background
    const overlayBody = document.getElementById('details-overlay-body');
    const closeButton = overlay.querySelector('.details-overlay-close');

    if (!overlay || !overlayBody || !closeButton || !overlayContentElement) {
        console.error('Overlay elements not found!');
        return;
    }

    // Apply hero image to .details-overlay-content
    if (section.heroImage) {
        overlayContentElement.style.backgroundImage = 
            `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 35%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%), url('${section.heroImage}')`;
        overlayContentElement.style.backgroundSize = 'cover';
        overlayContentElement.style.backgroundPosition = 'center top'; // Show top of image
        overlayContentElement.style.backgroundRepeat = 'no-repeat';
    } else {
        overlayContentElement.style.backgroundImage = 'none'; // Fallback: uses CSS background-color
    }

    // Populate overlay body content based on current language
    const lang = getCurrentLanguage();
    const detailedContent = section[lang === 'nl' ? 'detailedContent_nl' : 'detailedContent_en'] || section.detailedContent_en || '<p>Content not available.</p>';
    overlayBody.innerHTML = detailedContent;

    overlay.classList.add('visible');
    overlay.classList.remove('hidden'); // Ensure hidden is removed if it was there
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    window.activeOverlaySection = section; // Store the active section
}

function hideDetailsOverlay() {
    const overlay = document.getElementById('details-overlay');
    const overlayContentElement = document.getElementById('details-overlay-content'); // Correct target
    if (!overlay) return;

    overlay.classList.remove('visible');
    document.body.style.overflow = ''; 
    window.activeOverlaySection = null; 

    // Clear background image after transition to save memory and ensure clean state for next open
    // Only clear if it was set by JS, to allow CSS fallback if no heroImage
    if (overlayContentElement && overlayContentElement.style.backgroundImage !== 'none') {
        setTimeout(() => {
            overlayContentElement.style.backgroundImage = 'none';
        }, 350); // Match transition duration from CSS for .details-overlay
    }
}

function updateOverlayLanguage() {
    if (detailsOverlay && detailsOverlay.classList.contains('visible') && window.activeOverlaySection) {
        // Re-populate the overlay with the content for the new language
        const lang = getCurrentLanguage();
        const detailedContent = window.activeOverlaySection[lang === 'nl' ? 'detailedContent_nl' : 'detailedContent_en'] || window.activeOverlaySection.detailedContent_en || '<p>Content not available.</p>';
        detailsOverlayBody.innerHTML = detailedContent;
    }
}

export function updateCurrentSectionTextDisplay() {
    if (currentSectionIndex !== -1) { // Only update if a section is active
        updateSectionTextDisplay();
    }
}

export function getActiveSectionName() {
    if (currentSectionIndex !== -1 && sections[currentSectionIndex]) {
        return sections[currentSectionIndex].name;
    }
    return null;
}