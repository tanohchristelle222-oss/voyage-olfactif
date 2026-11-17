export const FRAGRANCE_THEMES = [
    { key: 'rose', label: 'Rose florale', colors: [0xae155e, 0xf064a2, 0xce357c], image: '/images/tracking/rose.png', words: ['rose', 'floral', 'florale', 'fleur', 'jasmin'] },
    { key: 'vanille', label: 'Vanille gourmande', colors: [0xd5820c, 0xf1b92c, 0xb26518], image: '/images/tracking/vanille.png', words: ['vanille', 'caramel', 'chocolat', 'gourmand', 'gourmande', 'sucre', 'sucree'] },
    { key: 'pistache', label: 'Pistache crémeuse', colors: [0x4a8b31, 0x91b83c, 0xb4862e], image: '/images/tracking/pistache.png', words: ['pistache'] },
    { key: 'agrumes', label: 'Agrumes lumineux', colors: [0xe58a0b, 0xecc12c, 0x9c7a21], image: null, words: ['agrumes', 'agrume', 'citron', 'orange', 'yuzu', 'mandarine', 'pamplemousse'] },
    { key: 'boise', label: 'Bois chaleureux', colors: [0x814c2c, 0xb67c32, 0x4f6e38], image: null, words: ['boise', 'boisee', 'cedre', 'santal', 'foret', 'bois'] },
];
export function fragranceState(journey = {}, previewCoffret = false) {
    const answers = journey.answers || {};
    const explicit = answers[1]?.fields?.scentFamily;
    let theme = FRAGRANCE_THEMES.find(item => item.key === explicit);
    if (!theme) {
        const text = Object.entries(answers).map(([, answer]) => [answer.text || '', ...(answer.tags || [])].join(' ')).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const matched = FRAGRANCE_THEMES.flatMap(item => item.words.flatMap(word => {
            const expression = new RegExp(`\\b${word}\\b`, 'g');
            return [...text.matchAll(expression)].filter(match => !/(?:sans|pas de|pas du|eviter la|eviter le)\s*$/.test(text.slice(Math.max(0, match.index - 14), match.index))).map(match => ({ theme: item, position: match.index, specific: ['rose', 'vanille', 'pistache', 'citron', 'yuzu', 'cedre', 'santal'].includes(word) }));
        })).sort((a, b) => Number(b.specific) - Number(a.specific) || b.position - a.position);
        theme = matched[0]?.theme;
    }
    const completed = journey.completed || [];
    let current = 1;
    while (current < 5 && completed.includes(current))
        current++;
    return { ...(theme || { key: 'inspiration', label: 'Votre univers à imaginer', colors: [0xa81265, 0xe84f99, 0xd69415], image: null }), current, ready: completed.includes(4) || completed.includes(5), coffretOpen: previewCoffret || completed.includes(4) || completed.includes(5) };
}
