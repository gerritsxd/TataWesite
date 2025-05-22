import { getCurrentLanguage } from './ui-language.js';

const sectionTextContainer = document.getElementById('section-text-container');
const sectionTextDiv = document.getElementById('section-text');

let waypointsRef = [];
let pathCurveRef = null;
let carModelRef = null;

let currentSectionIndex = -1; // Not in any section initially

// Section definitions with SVG icons
const sections = [
    {
        name: "Camera", start: 6, end: 16,
        en: { 
            title: "The Watchful Eye", 
            subtitle: "A community's camera on Tata Steel's emissions.", 
            content: "Residents use cameras to document Tata Steel's pollution, but face challenges in getting violations addressed due to legal loopholes and data handling.", 
            expandedContent: "Community and official cameras monitor Tata Steel for pollution. Despite court rulings supporting surveillance by agencies like Omgevingsdienst, a critical issue persists: video evidence of violations can be discarded by Tata Steel after two weeks due to 'privacy concerns,' often before review. This loophole means many complaints go unaddressed, undermining efforts to hold the company accountable and protect public health. It's a struggle for environmental justice where evidence and voices can be systematically silenced."
        },
        nl: { title: "Camera Sectie", subtitle: "Geavanceerde monitoring technologie", content: "Dit gebied toont geavanceerde cameratechnologie die wordt gebruikt voor monitoring en kwaliteitscontrole in de productiefaciliteiten van Tata Steel.", expandedContent: "Onze geavanceerde camerasystemen bewaken elke fase van het productieproces, zorgen voor kwaliteitscontrole en veiligheid van werknemers. Deze camera's gebruiken AI-gestuurde beeldherkenning om zelfs kleine defecten in realtime te detecteren." },
        iconSVG: `<svg class="icon-camera" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="#f47a23" /><rect x="16" y="2" width="4" height="4" rx="1" /></svg>`,
        imageSrc: null, 
    },
    {
        name: "Village", start: 28, end: 36,
        en: { 
            title: "Life in Wijk aan Zee", 
            subtitle: "Graphite rain, metallic dust, and constant noise.", 
            content: "Wijk aan Zee residents endure 'graphite rain' from Tata Steel, a black dust containing heavy metals and carcinogenic PAHs, posing serious health risks.", 
            expandedContent: "Graphite rain, laden with carcinogenic Polycyclic Aromatic Hydrocarbons (PAHs) and heavy metals from Tata Steel, plagues Wijk aan Zee. RIVM research shows a dramatic increase in carcinogens and lead levels in the village, with pollution up to five times higher than elsewhere. Experts warn these PAHs can alter DNA, leading to cancers. Professor Onno van Schayck calls the inaction by Tata Steel and authorities 'negligent,' stating, 'We already knew 50 years ago that these substances are carcinogenic... People are dying here.'"
        },
        nl: { title: "Dorpsgemeenschap", subtitle: "Duurzame woonoplossingen", content: "Een duurzame gemeenschap gebouwd met milieuvriendelijke bouwmaterialen van Tata Steel.", expandedContent: "Ons modeldorp laat zien hoe de duurzame bouwoplossingen van Tata Steel mooie, langdurige gemeenschappen kunnen creëren met minimale impact op het milieu. Deze huizen verbruiken 40% minder energie dan traditionele bouw." },
        iconSVG: `<svg class="icon-village" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1,21V10L8,3L15,10V21H1Z" /><path d="M12,21V14H22V21H12Z" /><path d="M5,12V14H8V12H5Z" fill="#f47a23" /><path d="M15,18V20H18V18H15Z" fill="#f47a23" /></svg>`,
        imageSrc: null, 
    },
    {
        name: "Playground", start: 43, end: 49,
        en: { 
            title: "Children's Playground", 
            subtitle: "Heavy metals where the future generation plays.", 
            content: "Playgrounds in the IJmond region are contaminated by Tata Steel's emissions, exposing children to black dust containing heavy metals and carcinogens.", 
            expandedContent: "Children in Wijk aan Zee and surrounding areas play on surfaces often covered in black dust from Tata Steel – the 'graphite rain.' This isn't just dirt; it contains harmful heavy metals and PAHs, known carcinogens. The direct exposure in areas meant for recreation poses a significant threat to their developing bodies, as these substances can damage DNA and lead to severe health issues, including cancer. The future of a generation is at stake due to this ongoing pollution."
        },
        nl: { title: "Speeltuingebied", subtitle: "Veilige en duurzame apparatuur", content: "Innovatieve speeltuinuitrusting gemaakt van duurzame, weerbestendige Tata Steel-producten.", expandedContent: "De veiligheid van kinderen is onze prioriteit. Onze speeltuinuitrusting ondergaat strenge tests om ervoor te zorgen dat deze bestand is tegen alle weersomstandigheden en veilig en aantrekkelijk blijft voor kinderen van alle leeftijden." },
        iconSVG: `<svg class="icon-playground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8,2V8H4L8,22H10L6,8H8V2Z" class="swing" /><path d="M16,2V8H12L16,22H18L14,8H16V2Z" class="swing" /><path d="M2,8H22V10H2V8Z" stroke="#74c047" stroke-width="0.5" /></svg>`,
        imageSrc: null, 
    },
    {
        name: "Tata", start: 55, end: 62,
        en: { 
            title: "Tata Steel's Perspective", 
            subtitle: "Claims of progress vs. the untold story.", 
            content: "Tata Steel outlines plans for CO2-neutral steel by 2045 and environmental improvements by 2025. But are these efforts enough, and are they arriving in time?", 
            expandedContent: "Tata Steel Nederland aims for CO2-neutral steel by 2045 using hydrogen, projecting a 35-40% CO2 reduction by 2030, and completing its 'Roadmap Plus' environmental measures by 2025. While these green initiatives are steps forward, critics argue they are reactive, spurred by public pressure after years of environmental damage and health concerns. The question remains whether these actions are sufficient and timely to rectify past harm. Public vigilance is crucial to ensure Tata meets not just its goals, but its responsibility to the community."
        },
        nl: { title: "Tata Steel Hoofdkantoor", subtitle: "Het hart van innovatie", content: "De centrale hub van operaties, waar innovatie traditie ontmoet.", expandedContent: "Ons hoofdkantoor combineert traditionele waarden met geavanceerde innovatie. Vanuit dit centrum coördineren we wereldwijde operaties terwijl we de volgende generatie staalproducten ontwikkelen die onze toekomst zullen vormgeven." },
        iconSVG: `<svg class="icon-tata" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4,4H20V20H4V4Z" stroke-width="2" fill="none" stroke="#f47a23" /><path d="M8,8V16" stroke-width="2" stroke="#10afef" /><path d="M12,8V16" stroke-width="2" stroke="#10afef" /><path d="M16,8V16" stroke-width="2" stroke="#10afef" /><path d="M8,8H16" stroke-width="2" stroke="#10afef" /><path d="M8,12H16" stroke-width="2" stroke="#10afef" /></svg>`,
        imageSrc: null, 
    },
    {
        name: "Hospital", 
        start: 65, end: 70, 
        en: { 
            title: "Health Impacts", 
            subtitle: "The consequences of living near a steel factory.", 
            content: "Living near Tata Steel is linked to severe health issues. Studies show increased carcinogens, heavy metals, and related illnesses in the IJmond region.", 
            expandedContent: "The RIVM found carcinogenic substances in Wijk aan Zee increased up to fourfold in a year, with significantly higher lead levels. Pollution in nearby areas is often twice as high, and up to five times higher near the Tata site. The primary pollutants, PAHs, are known to cause cancer and damage eyes, liver, and kidneys by altering DNA. Professor Onno van Schayck highlights the long-known dangers: 'We already knew 50 years ago that these substances are carcinogenic.' He warns, 'People are dying here,' condemning the ongoing failure to act as 'negligent.'"
        },
        nl: { title: "Gezondheidsgevolgen", subtitle: "De consequenties van wonen nabij een staalfabriek.", content: "Gedetailleerde informatie over gezondheidsstudies en lokale zorgen.", expandedContent: "Studies hebben correlaties aangetoond tussen de nabijheid van staalfabrieken en een toename van ademhalingsproblemen, evenals zorgen over langdurige blootstelling aan fijnstof en zware metalen. Dit gedeelte onderzoekt de beschikbare gegevens en rapporten over de gezondheid van de gemeenschap." },
        iconSVG: `<svg class="icon-hospital" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6H6V18H18V6Z" stroke-width="2" fill="none" stroke="#E74C3C" /><path d="M12 9V15M9 12H15" stroke-width="2" stroke="#E74C3C" /></svg>`,
        imageSrc: null, 
    },
    {
        name: "Plane", start: 75, end: 81, 
        en: { 
            title: "Two Futures", 
            subtitle: "Shutdown like Pittsburgh, or green like Sweden?", 
            content: "IJmond faces a choice: follow Pittsburgh's path of industrial closure and health recovery, or Sweden's model of green steel innovation. What future will it choose?", 
            expandedContent: "**The Pittsburgh Precedent:**\nShenango Coke Works in Pittsburgh, similar to Tata Steel, caused severe air pollution. Its closure in 2016 led to dramatically improved air quality. Emergency room visits for cardiovascular disease among nearby residents dropped by 42% initially, and 61% over three years, highlighting the direct health benefits of reduced industrial pollution.\n\n**The Swedish Model for Green Steel:**\nSwedish companies like SSAB and Ovako are pioneering fossil-free steel. SSAB aims for carbon neutrality by 2030 using hydrogen from renewable energy, avoiding carbon penalties. Ovako launched the world's first fossil-free hydrogen-powered steel heating plant, cutting emissions by up to 80%. These initiatives, part of the HYBRIT venture, prove that sustainable, economically viable steel production is possible now. Sweden's success offers a clear, achievable path for Tata Steel and IJmond."
        },
        nl: { title: "Transportknooppunt", subtitle: "Mensen en goederen verplaatsen", content: "Toont hoe Tata Steel bijdraagt aan moderne transportinfrastructuur.", expandedContent: "Onze gespecialiseerde staalproducten zijn essentiële componenten in vliegtuigen, spoorwegen en automobiele toepassingen. Tata Steel levert aangepaste legeringen die gewicht, sterkte en duurzaamheid in balans brengen voor de transportsector." },
        iconSVG: `<svg class="icon-plane" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,16L14,8L14,3C14,2.4477 13.5523,2 13,2L11,2C10.4477,2 10,2.4477 10,3L10,8L2,16L2,18L10,16L10,21C10,21.5523 10.4477,22 11,22L13,22C13.5523,22 14,21.5523 14,21L14,16L22,18L22,16Z" /></svg>`,
        imageSrc: "https://via.placeholder.com/320x180?text=Transportation+Hub"
    },
];

export function initSections(_waypoints, _pathCurve, _carModel) {
    waypointsRef = _waypoints;
    pathCurveRef = _pathCurve;
    carModelRef = _carModel;

    // Initially hide or set default text
    if (sectionTextContainer) sectionTextContainer.style.opacity = '0';
    updateSectionTextDisplay(); // Show welcome/default text if applicable
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
                <div class="section-subtitle">${content.subtitle || content.content.substring(0, 70) + '...'}</div>
            </div>
        </div>
        <div class="section-content">
            <div class="section-content-inner">
                <p>${content.expandedContent || content.content}</p>
                ${mediaHTML}
            </div>
        </div>
    `;

    sectionTextContainer.style.opacity = '1';
    sectionTextDiv.classList.remove('expanded'); // Start collapsed

    setupExpandableBehavior();
}

function setupExpandableBehavior() {
    const header = sectionTextDiv.querySelector('.section-header');
    const icon = sectionTextDiv.querySelector('.section-icon');

    if (header) {
        header.onclick = (e) => {
            if (icon && icon.contains(e.target)) return; // Don't toggle if icon was clicked
            sectionTextDiv.classList.toggle('expanded');
        };
    }

    if (icon) {
        icon.onclick = (e) => {
            e.stopPropagation(); // Prevent header click
            
            if (currentSectionIndex !== -1 && waypointsRef.length > 0 && pathCurveRef && carModelRef) {
                const section = sections[currentSectionIndex];
                // Focus on the middle of the section
                const middleWaypointIndex = Math.floor((section.start + section.end) / 2);
                
                // Import three-main's positionCarAtWaypoint or pathProgress update
                import('./three-main.js').then(threeMain => {
                    // This is a bit of a hack. Better to expose a function in three-main.js
                    // to set pathProgress or jump to a waypoint.
                    // For now, directly try to call something if available, or log.
                    if (threeMain.positionCarAtWaypoint) {
                         threeMain.positionCarAtWaypoint(middleWaypointIndex);
                    } else {
                        console.log("Need a function from three-main to jump to waypoint.");
                    }
                });

                icon.style.transform = 'scale(1.2)';
                setTimeout(() => icon.style.transform = '', 300);
            }
        };
    }
}

// Call this function when language changes
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