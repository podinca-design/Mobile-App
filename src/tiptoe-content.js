const PACK_DEFINITIONS = [
  {
    id: "party",
    label: "Party",
    accent: "#FFB84D",
    defaults: ["party", "friends", "night", "fun", "music", "group", "celebrate", "event"],
    targets: `afterparty|karaoke|dance floor|group chat|bottle service|photo booth|playlist|last call|party favor|house rules|birthday cake|surprise party|costume party|pool party|dinner party|game night|guest list|party host|door prize|confetti|disco ball|dance battle|DJ booth|song request|crowd surf|conga line|limbo contest|toast speech|champagne tower|mocktail bar|snack table|pizza delivery|ice breaker|inside joke|party crasher|plus one|dress code|coat check|VIP section|rooftop party|backyard barbecue|bonfire|road trip|weekend getaway|hotel lobby|room service|sleepover|pillow fight|movie night|board game|card game|charades|trivia night|scavenger hunt|talent show|open mic|comedy club|concert ticket|festival wristband|dance remix|favorite song|singalong|air guitar|drum solo|slow song|encore|stage dive|glow stick|neon sign|party hat|balloon arch|paper crown|gift bag|birthday candle|wish list|thank-you card|group photo|selfie stick|camera flash|red cup|cooler|ice bucket|drink coaster|name tag|seating chart|reservation|valet parking|designated driver|rideshare|midnight countdown|New Year's Eve|holiday party|graduation party|engagement party|wedding reception|reunion|housewarming|block party|tailgate|watch party|brunch|happy hour`.split("|"),
  },
  {
    id: "flirty",
    label: "Flirty",
    accent: "#E0529C",
    defaults: ["date", "romance", "attraction", "couple", "feelings", "chemistry", "crush", "love"],
    targets: `first crush|slow dance|eye contact|pickup line|chemistry|date night|butterflies|compliment|love language|midnight text|first date|blind date|double date|coffee date|dinner date|movie date|beach date|picnic date|road-trip romance|meet cute|secret admirer|love letter|handwritten note|good-morning text|good-night call|first kiss|forehead kiss|holding hands|warm hug|cuddle weather|private joke|pet name|matching outfits|couple selfie|anniversary|proposal|engagement ring|wedding vows|honeymoon|soulmate|spark|instant connection|long-distance love|reunion kiss|romantic surprise|flowers|box of chocolates|candlelight dinner|rose petals|favorite perfume|favorite cologne|charming smile|deep conversation|shared playlist|our song|dance partner|wedding guest|wedding date|flirty banter|playful tease|blushing|nervous laugh|winking|lingering look|rom-com date|love story|celebrity crush|dream date|perfect match|relationship goals|quality time|words of affirmation|acts of service|gift giving|physical touch|emotional connection|trust|commitment|loyalty|vulnerability|second chance|missed connection|friend zone|first impression|green flag|red flag|deal breaker|type on paper|opposites attract|shared values|future plans|weekend together|spontaneous trip|breakfast in bed|sunset walk|stargazing|rainy-day date|slow morning|romantic getaway|surprise visit|meet the family`.split("|"),
  },
  {
    id: "pop",
    label: "Pop Culture",
    accent: "#34D6B0",
    defaults: ["show", "movie", "music", "celebrity", "internet", "famous", "screen", "entertainment"],
    targets: `red carpet|reality TV|viral trend|movie trailer|podcast|streaming|fan theory|spoiler alert|theme song|award speech|blockbuster|indie film|movie premiere|opening night|box office|film festival|director's cut|plot twist|cliffhanger|season finale|series reboot|spin-off|cameo|stunt double|movie star|supporting actor|screen test|casting call|audition|voice actor|animated movie|superhero|supervillain|secret identity|origin story|time travel|parallel universe|space opera|detective story|romantic comedy|sitcom|game show|talk show|late-night host|documentary|true crime|news anchor|weather reporter|commercial break|binge watch|watch list|streaming password|remote control|closed captions|opening credits|post-credit scene|soundtrack|music video|chart topper|one-hit wonder|boy band|girl group|lead singer|backup dancer|world tour|concert encore|festival headliner|album cover|vinyl record|mixtape|remix|karaoke classic|dance challenge|internet meme|reaction video|unboxing video|influencer|content creator|live stream|subscriber|notification bell|hashtag|trending topic|direct message|emoji|filter|photo dump|celebrity couple|paparazzi|fashion week|runway model|designer label|award show|acceptance speech|golden statue|fan club|autograph|comic convention|cosplay|collectible|trading card|limited edition`.split("|"),
  },
];

function forbiddenWords(target, defaults, index) {
  const targetWords = target.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2);
  const rotated = [defaults[index % defaults.length], defaults[(index + 3) % defaults.length], defaults[(index + 5) % defaults.length]];
  return [...new Set([...targetWords, ...rotated])].slice(0, 4);
}

export const TIPTOE_PACKS = PACK_DEFINITIONS.map((pack) => ({
  id: pack.id,
  label: pack.label,
  accent: pack.accent,
  cards: pack.targets.map((target, index) => ({
    id: `tiptoe_${pack.id}_${String(index + 1).padStart(3, "0")}`,
    topic_pack: pack.id,
    target,
    forbidden: forbiddenWords(target, pack.defaults, index),
  })),
}));

export function validateTiptoePacks(packs = TIPTOE_PACKS) {
  const ids = new Set();
  const targets = new Set();
  const errors = [];
  for (const pack of packs) {
    if (pack.cards.length < 100) errors.push(`${pack.id} has only ${pack.cards.length} cards`);
    for (const card of pack.cards) {
      const normalizedTarget = card.target.trim().toLocaleLowerCase("en-US");
      if (ids.has(card.id)) errors.push(`duplicate card id ${card.id}`);
      if (targets.has(normalizedTarget)) errors.push(`duplicate target ${card.target}`);
      if (!card.forbidden?.length) errors.push(`missing forbidden words ${card.id}`);
      ids.add(card.id);
      targets.add(normalizedTarget);
    }
  }
  return { valid: errors.length === 0, errors, cardCount: ids.size, targetCount: targets.size };
}
