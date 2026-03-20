export const SURGE_TEMPLATES = [
  'The hype around {Company} is reaching a fever pitch in {Community}. Prices are sky-high!',
  'A major VC just went all-in on {Company} tokens. {Community} is going wild!',
  '{Company} just announced AGI. {Community} can\'t stop talking about it. Prices are insane!',
  'Elon tweeted about {Company} and {Community} imploded. Moon mission confirmed.',
  '{Company} tokens are flying off the shelves in {Community}. Demand is unprecedented!',
  'A celebrity endorsement has sent {Company} prices through the roof in {Community}.',
  '{Community} insiders are stacking {Company} like there\'s no tomorrow. FOMO is real.',
  'A leaked roadmap for {Company} has {Community} in a frenzy. Prices have 5x\'d overnight.',
];

export const CRASH_TEMPLATES = [
  'A major security breach has compromised {Company} infrastructure. Token value has cratered!',
  'A new open-source model has disrupted {Company}. Prices are bottoming out!',
  'A whistleblower in {Community} exposed {Company}\'s training data scandal. Prices tanked.',
  'The SEC froze all {Company} transactions. {Community} is in panic mode.',
  '{Company} accidentally leaked their weights. The market is in freefall in {Community}.',
  'A coordinated short attack on {Company} has wiped out gains in {Community}.',
  '{Company}\'s flagship model just failed a public safety audit. {Community} is dumping.',
  'A congressional hearing named {Company} as a systemic risk. Prices collapsed.',
];

export const INVENTORY_EXPANSION_TEMPLATES = [
  'You found a discarded {Storage_Device} in {Community}. You can now carry more tokens!',
  'A generous dev in {Community} left a {Storage_Device} on a park bench. Extra capacity unlocked.',
  'Dumpster diving behind a {Community} data center paid off. {Storage_Device} found. +25 capacity.',
  'A {Storage_Device} fell out of someone\'s pocket in {Community}. Finders keepers. More room.',
  'You traded a meme NFT for a {Storage_Device} in {Community}. Capacity increased.',
  'A stranger in {Community} handed you a {Storage_Device} and said "you\'ll need this". Odd.',
  'You won a {Storage_Device} in a {Community} trivia contest. Inventory expanded.',
  'An anonymous tip led you to a {Storage_Device} hidden in {Community}. Jackpot.',
];

export const RESOURCE_INFLUX_TEMPLATES = [
  'A venture capitalist in {Community} gave you {Quantity} units of {Company} to \'spread the word\'!',
  'A {Company} dev airdropped {Quantity} tokens to everyone in {Community}. You caught some.',
  'You completed a {Company} survey in {Community} and received {Quantity} tokens as payment.',
  'A whale in {Community} is distributing {Quantity} {Company} tokens for \'marketing purposes\'.',
  'You helped debug a {Company} repo in {Community}. They paid you {Quantity} tokens.',
  '{Company} ran a promotional campaign in {Community}. You snagged {Quantity} free tokens.',
  'A {Company} ambassador in {Community} liked your post. {Quantity} tokens deposited.',
  'You found {Quantity} {Company} tokens in an old {Community} thread. Someone forgot to claim them.',
];

export const POSITIVE_EVENT_TEMPLATES = [
  'You found {Quantity} {Company} tokens on an old laptop you dug out of storage.',
  'You won the {Community} giveaway! {Quantity} {Company} tokens have been deposited.',
  'A {Company} dev airdropped {Quantity} tokens to loyal holders in {Community}. You qualified.',
  'You completed a {Company} bug bounty in {Community} and earned {Quantity} tokens.',
  'Someone left {Quantity} {Company} tokens unclaimed in an old {Community} thread. They\'re yours now.',
  'A whale in {Community} is giving away {Quantity} {Company} tokens for good vibes. You qualify.',
  'You helped moderate a {Community} server and got tipped {Quantity} {Company} tokens.',
  'A {Company} ambassador liked your post in {Community}. {Quantity} tokens as a thank you.',
  'You found a forgotten wallet with {Quantity} {Company} tokens while browsing {Community}.',
  '{Company} ran a referral campaign in {Community}. Your referral chain earned you {Quantity} tokens.',
];

export const FTC_TEMPLATES = [
  'The FTC is raiding {Community}! Run or Stay and Fight?',
  'Plainclothes regulators just swept into {Community}. Do you run or stand your ground?',
  'A tip-off brought the feds to {Community}. Everyone\'s scattering. What do you do?',
  'SEC agents are checking wallets in {Community}. You\'ve been spotted. Run or fight?',
  'A compliance drone is scanning {Community}. You\'re flagged. Flee or face them?',
  'The regulators finally found {Community}. Your exit is closing. Run or Stay and Fight?',
  'Two agents in dark suits just entered {Community}. They\'re heading your way. Run or fight?',
  'A market surveillance alert has triggered in {Community}. Agents incoming. Your move.',
];

export const ROBBERY_TEMPLATES = [
  'You got robbed on the way to {Community}! Someone lifted {Amount} from your pockets.',
  'A pickpocket in {Community} hit you before you could react. {Amount} is gone.',
  'Your transfer to {Community} was intercepted. {Amount} in cash stolen. Bank untouched.',
  'Someone shoulder-surfed your credentials near {Community}. {Amount} drained from your wallet.',
  'A mugging outside {Community}\'s server farm cost you {Amount}. Keep your head down.',
  'A social engineering attack between communities netted a thief {Amount} of your cash.',
  'You were ambushed near {Community}. {Amount} gone. At least the bank is safe.',
  'A flash mob in {Community} distracted you while someone lifted {Amount} from your account.',
];

export const BANK_HACK_TEMPLATES = [
  'Your bank account was breached! {Amount} has been siphoned by a remote attacker.',
  'A zero-day exploit hit the bank servers. {Amount} of your savings is gone.',
  'An APT group targeted financial institutions. You lost {Amount} from your account.',
  'Phishing attack successful — the attacker cleared {Amount} from your bank balance.',
  'A state-sponsored hacker group raided your savings. {Amount} is unrecoverable.',
  'Your bank notified you of "unusual activity". {Amount} was transferred out without your consent.',
  'A supply chain attack on the banking software cost you {Amount} in savings.',
  'Your account was compromised in a credential stuffing attack. {Amount} stolen from the bank.',
];

export const STORAGE_DEVICES = [
  'USB drive',
  'external SSD',
  'cold storage wallet',
  'encrypted flash drive',
  'portable hard drive',
  'NAS device',
  'Raspberry Pi cluster',
  'RAID array',
];

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fillTemplate(template: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce(
    (str, [key, val]) => str.split(`{${key}}`).join(val),
    template
  );
}
