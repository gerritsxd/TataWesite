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
        en: { title: "Camera Section", subtitle: "Advanced monitoring technology", content: "This area showcases advanced camera technology used in monitoring and quality control throughout Tata Steel's manufacturing facilities.", expandedContent: "Our state-of-the-art camera systems monitor every stage of the production process, ensuring quality control and worker safety. These cameras use AI-powered image recognition to detect even minor defects in real-time." },
        nl: { title: "Camera Sectie", subtitle: "Geavanceerde monitoring technologie", content: "Dit gebied toont geavanceerde cameratechnologie die wordt gebruikt voor monitoring en kwaliteitscontrole in de productiefaciliteiten van Tata Steel.", expandedContent: "Onze geavanceerde camerasystemen bewaken elke fase van het productieproces, zorgen voor kwaliteitscontrole en veiligheid van werknemers. Deze camera's gebruiken AI-gestuurde beeldherkenning om zelfs kleine defecten in realtime te detecteren." },
        iconSVG: `<svg class="icon-camera" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="#f47a23" /><rect x="16" y="2" width="4" height="4" rx="1" /></svg>`,
        imageSrc: null, // "https://via.placeholder.com/320x180?text=Camera+Tech"
    },
    {
        name: "Village", start: 28, end: 36,
        en: { title: "Village Community", subtitle: "Sustainable living solutions", content: "A sustainable community built with Tata Steel's eco-friendly construction materials.", expandedContent: "Our model village demonstrates how Tata Steel's sustainable construction solutions can create beautiful, long-lasting communities with minimal environmental impact. These homes use 40% less energy than traditional construction." },
        nl: { title: "Dorpsgemeenschap", subtitle: "Duurzame woonoplossingen", content: "Een duurzame gemeenschap gebouwd met milieuvriendelijke bouwmaterialen van Tata Steel.", expandedContent: "Ons modeldorp laat zien hoe de duurzame bouwoplossingen van Tata Steel mooie, langdurige gemeenschappen kunnen creëren met minimale impact op het milieu. Deze huizen verbruiken 40% minder energie dan traditionele bouw." },
        iconSVG: `<svg class="icon-village" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1,21V10L8,3L15,10V21H1Z" /><path d="M12,21V14H22V21H12Z" /><path d="M5,12V14H8V12H5Z" fill="#f47a23" /><path d="M15,18V20H18V18H15Z" fill="#f47a23" /></svg>`,
        imageSrc: null, // "https://via.placeholder.com/320x180?text=Sustainable+Village"
    },
    {
        name: "Playground", start: 43, end: 49,
        en: { title: "Playground Area", subtitle: "Safe and durable equipment", content: "Innovative playground equipment made from durable, weather-resistant Tata Steel products.", expandedContent: "Children's safety is our priority. Our playground equipment undergoes rigorous testing to ensure it withstands all weather conditions while remaining safe and engaging for children of all ages." },
        nl: { title: "Speeltuingebied", subtitle: "Veilige en duurzame apparatuur", content: "Innovatieve speeltuinuitrusting gemaakt van duurzame, weerbestendige Tata Steel-producten.", expandedContent: "De veiligheid van kinderen is onze prioriteit. Onze speeltuinuitrusting ondergaat strenge tests om ervoor te zorgen dat deze bestand is tegen alle weersomstandigheden en veilig en aantrekkelijk blijft voor kinderen van alle leeftijden." },
        iconSVG: `<svg class="icon-playground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8,2V8H4L8,22H10L6,8H8V2Z" class="swing" /><path d="M16,2V8H12L16,22H18L14,8H16V2Z" class="swing" /><path d="M2,8H22V10H2V8Z" stroke="#74c047" stroke-width="0.5" /></svg>`,
        imageSrc: null, // "https://via.placeholder.com/320x180?text=Playground"
    },
    {
        name: "Tata", start: 55, end: 62,
        en: { title: "Tata Steel Headquarters", subtitle: "The heart of innovation", content: "The central hub of operations, where innovation meets tradition.", expandedContent: "Our headquarters combines traditional values with cutting-edge innovation. From this center, we coordinate global operations while developing the next generation of steel products that will shape our future." },
        nl: { title: "Tata Steel Hoofdkantoor", subtitle: "Het hart van innovatie", content: "De centrale hub van operaties, waar innovatie traditie ontmoet.", expandedContent: "Ons hoofdkantoor combineert traditionele waarden met geavanceerde innovatie. Vanuit dit centrum coördineren we wereldwijde operaties terwijl we de volgende generatie staalproducten ontwikkelen die onze toekomst zullen vormgeven." },
        iconSVG: `<svg class="icon-tata" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4,4H20V20H4V4Z" stroke-width="2" fill="none" stroke="#f47a23" /><path d="M8,8V16" stroke-width="2" stroke="#10afef" /><path d="M12,8V16" stroke-width="2" stroke="#10afef" /><path d="M16,8V16" stroke-width="2" stroke="#10afef" /><path d="M8,8H16" stroke-width="2" stroke="#10afef" /><path d="M8,12H16" stroke-width="2" stroke="#10afef" /></svg>`,
        imageSrc: null, // "https://via.placeholder.com/320x180?text=Tata+HQ"
    },
    {
        name: "Empty", // Represents Research Zone
        start: 72, end: 74,
        en: { title: "Research Zone", subtitle: "Creating tomorrow's steel", content: "Where the next generation of steel technologies are being developed and tested.", expandedContent: "Our research facilities work tirelessly to develop stronger, lighter, and more sustainable steel products. Recent innovations include ultra-high-strength steel that reduces vehicle weight by 20% while improving safety." },
        nl: { title: "Onderzoekszone", subtitle: "Het staal van morgen creëren", content: "Waar de volgende generatie staaltechnologieën worden ontwikkeld en getest.", expandedContent: "Onze onderzoeksfaciliteiten werken onvermoeibaar aan de ontwikkeling van sterkere, lichtere en duurzamere staalproducten. Recente innovaties omvatten ultrasterk staal dat het gewicht van voertuigen met 20% vermindert en tegelijkertijd de veiligheid verbetert." },
        iconSVG: `<svg class="icon-research" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2L14,7H20L16,12L18,18L12,15L6,18L8,12L4,7H10L12,2Z" /><circle cx="12" cy="12" r="2" fill="#74c047" /></svg>`,
        imageSrc: null, // "https://via.placeholder.com/320x180?text=Research+Zone"
    },
    {
        name: "Plane", start: 75, end: 81,
        en: { title: "Transportation Hub", subtitle: "Moving people and goods", content: "Showcasing how Tata Steel contributes to modern transportation infrastructure.", expandedContent: "Our specialized steel products are essential components in aircraft, railways, and automotive applications. Tata Steel provides custom alloys that balance weight, strength, and durability for the transportation sector." },
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