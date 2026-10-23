/* ChannelE2E content, read off their live homepage on 23 October 2026.
   Images are not copied: thumb() builds the URL of their own thumbor proxy,
   so every picture is served from their CDN exactly as it is on their site. */
window.C2E = (function () {
  var F = 'https://files.cyberriskalliance.com/wp-content/uploads/';
  function thumb(path, w) {
    return 'https://www.channele2e.com/api/thumbor-proxy?width=' + (w || 768) +
           '&src=' + encodeURIComponent(F + path);
  }
  var S = 'https://www.channele2e.com';   /* their live site, for every editorial link */

  var LEAD = { t: 'Soaring PC component prices create sticker shock for MSP clients',
    u: S + '/news/soaring-pc-component-prices-create-sticker-shock-for-msp-clients',
    by: 'ChannelE2E Team', d: 'October 22, 2026', topic: '', img: '2026/10/AdobeStock_274413590.jpeg' };

  var TOP = [
    { t: 'Mailprotector launches Shield Blueprints to simplify email security',
      u: S + '/news/mailprotector-launches-shield-blueprints-to-simplify-email-security',
      by: 'ChannelE2E Team', d: 'October 22, 2026', topic: 'Email security',
      img: '2026/10/AdobeStock_1912550558-JB-copy.jpg' },
    { t: 'Dr. Backup acquisition could bring new resources to MSPs',
      u: S + '/news/dr-backup-acquisition-could-bring-new-resources-to-msps',
      by: 'ChannelE2E Team', d: 'October 21, 2026', topic: 'Channel technologies',
      img: '2026/03/AdobeStock_1488868150-scaled.jpeg' }
  ];

  var PERSPECTIVES = [
    { t: 'Public cloud wasn’t built for every AI workload',
      u: S + '/perspective/public-cloud-wasnt-built-for-every-ai-workload',
      by: 'Tim Burke', d: 'August 17, 2026', img: '2026/01/012826_ai_server_security.jpg' },
    { t: 'The new era of email resilience: How MSPs are redefining security at scale',
      u: S + '/perspective/the-new-era-of-email-resilience-how-msps-are-redefining-security-at-scale',
      by: 'Olesia Klevchuk', d: 'August 12, 2026', img: '2026/07/072826_phishing.jpg' },
    { t: 'MSPs need to push clients past AI experimentation',
      u: S + '/perspective/msps-need-to-push-clients-past-ai-experimentation',
      by: 'Dan Zaniewski', d: 'August 10, 2026', img: '2026/07/AdobeStock_2083667617-scaled.jpeg' }
  ];

  var BRIEFS = [
    { t: 'Channel Brief: AI-native is the new pitch. MSPs are still working out the pricing.',
      u: S + '/news/channel-brief-msps-are-all-in-on-ai-the-revenue-still-hasnt-followed-1',
      img: '2026/07/AdobeStock_2083667617-scaled.jpeg' },
    { t: 'Channel Brief: MSPs are all in on AI. The revenue still hasn’t followed',
      u: S + '/news/channel-brief-msps-are-all-in-on-ai-the-revenue-still-hasnt-followed',
      img: '2026/07/AdobeStock_864787170-scaled.jpeg' },
    { t: 'Channel Brief: Nearly one in three SMBs is stuck testing AI',
      u: S + '/news/channel-brief-ai-adoption-is-surging-but-mid-market-security-is-falling-behind',
      img: '2026/07/AdobeStock_2011956190-scaled.jpeg' }
  ];

  var CRA = [
    { t: 'Alternative Payments brings agentic AI to MSP back-office operations',
      u: S + '/brief/alternative-payments-brings-agentic-ai-to-msp-back-office-operations' },
    { t: 'Channel Brief: GTIA acquires The ASCII Group',
      u: S + '/brief/channel-brief-gtia-acquires-the-ascii-group' },
    { t: 'TD SYNNEX expands IBM distribution across Europe, Asia and Latin America',
      u: S + '/brief/td-synnex-expands-ibm-distribution-across-europe-asia-and-latin-america' }
  ];

  var GUEST = [
    { t: 'Overcoming Lifecycle Chaos: Mastering Advanced Access Automation',
      u: S + '/native/overcoming-lifecycle-chaos-mastering-advanced-access-automation',
      by: 'Antoine Jebara', d: 'September 29, 2026', img: '2026/09/AdobeStock_2085849370-scaled.jpeg' },
    { t: 'Why organizations need a new approach to MDR (part 1)',
      u: S + '/native/why-organizations-need-a-new-approach-to-mdr-part-1',
      by: 'ChannelE2E Editorial Staff', d: 'September 18, 2026', img: '2026/09/AdobeStock_2007166289-1-scaled.jpeg' },
    { t: 'OpenText and Hatz AI Partner to Support MSP AI Readiness',
      u: S + '/native/opentext-and-hatz-ai-partner-to-support-msp-ai-readiness',
      by: 'ChannelE2E Editorial Staff', d: 'September 18, 2026',
      img: '2026/09/AD-4532573413-paid-media-display-ads-ai-security-fastlane-177X103-01-3.png' }
  ];

  var LATEST = [
    { t: 'MSPs can help SMBs strengthen cybersecurity without overspending',
      u: S + '/news/msps-can-help-smbs-strengthen-cybersecurity-without-overspending',
      by: 'ChannelE2E Team', d: 'October 20, 2026', topic: 'Security Management',
      img: '2026/10/AdobeStock_2069075427.jpeg' },
    { t: 'Eight ways MSPs can grow revenue without adding headcount',
      u: S + '/news/eight-ways-msps-can-grow-revenue-without-adding-headcount',
      by: 'ChannelE2E Team', d: 'October 20, 2026', topic: 'Channel partners',
      img: '2026/10/msp_money_growth_blue_under_100kb.jpg' },
    { t: 'Proofpoint’s plan to bolster data security against AI risks',
      u: S + '/news/proofpoint-acquires-varonis-for-6-3-billion-to-bolster-data-security-against-ai-risks',
      by: 'ChannelE2E Team', d: 'October 19, 2026', topic: 'Data Security',
      img: '2026/10/Cybersecurity-Partnership-in-the-Future-Office-copy.jpg' },
    { t: 'Portal26 launches AI governance platform for MSPs',
      u: S + '/news/portal26-launches-ai-governance-platform-for-msps',
      by: 'ChannelE2E Team', d: 'October 19, 2026', topic: 'AI/ML',
      img: '2026/10/P26Capabilities-1-scaled-1-1024x495-1.png' },
    { t: 'Hidden AI costs create a new revenue opportunity for MSPs',
      u: S + '/news/ai-security-tools-offer-unexpected-visibility-into-spending',
      by: 'ChannelE2E Team', d: 'October 19, 2026', topic: 'Security Operations',
      img: '2026/09/AdobeStock_2213725181.jpeg' },
    { t: 'AI-discovered vulnerabilities frequently lead to remote code execution',
      u: S + '/news/ai-discovered-vulnerabilities-disproportionately-lead-to-remote-code-execution',
      by: 'ChannelE2E Team', d: 'October 16, 2026', topic: 'Threat Intelligence',
      img: '2026/09/AdobeStock_1092778895.jpeg' }
  ];

  var MOSTREAD = [
    { t: 'Jonathan Berger knows the partner side. That is shaping his SonicWall channel plan.',
      u: S + '/news/jonathan-berger-knows-the-partner-side-that-is-shaping-his-sonicwall-channel-plan',
      by: 'Suparna Chawla Bhasin', d: 'June 11, 2026', img: '2025/08/AdobeStock_234044393-scaled.jpeg' },
    { t: 'The firewall was supposed to die. MSPs are still betting on it',
      u: S + '/perspective/the-firewall-was-supposed-to-die-msps-are-still-betting-on-it',
      by: 'Chandrodaya Prasad', d: 'June 1, 2026', img: '2025/08/081225_exploit.jpg' },
    { t: 'Experts weigh in: Cybersecurity pricing and packaging strategies for MSSPs',
      u: S + '/news/experts-weigh-in-cybersecurity-pricing-and-packaging-strategies-for-mssps',
      by: 'Jonathan Browning', d: 'June 12, 2026', img: '2026/04/AdobeStock_1955547794.jpeg' },
    { t: 'Pax8 wants MSPs to turn SMB AI demand into managed services',
      u: S + '/news/pax8-wants-msps-to-turn-smb-ai-demand-into-managed-services',
      by: 'Suparna Chawla Bhasin', d: 'June 10, 2026', img: '2026/06/AdobeStock_288623237-scaled.jpeg' }
  ];

  /* their own M&A block, as it stands today */
  var MNA = [
    { t: 'Accenture plans $5 billion in acquisitions over the next year',
      u: S + '/news/accenture-plans-5-billion-in-acquisitions-over-the-next-year',
      by: 'ChannelE2E Team', d: 'October 9, 2026', img: '2023/08/mergers-acquisitions-6.jpg' },
    { t: 'TD SYNNEX strikes deal to acquire specialty distributor BlueStar',
      u: S + '/news/td-synnex-strikes-deal-to-acquire-specialty-distributor-bluestar',
      by: 'ChannelE2E Team', d: 'October 8, 2026',
      img: '2026/10/AdobeStock_2037149948_ModernFiles-16x9-crop-scaled.jpeg' },
    { t: 'WEBIT founder turns succession into employee ownership',
      u: S + '/news/webit-founder-turns-succession-into-employee-ownership',
      by: 'ChannelE2E Team', d: 'October 1, 2026', img: '2026/10/webit-cropped.jpg' },
    { t: 'Kiteworks expands into Japan with WAMNET acquisition',
      u: S + '/brief/kiteworks-expands-into-japan-with-wamnet-acquisition',
      by: 'ChannelE2E Team', d: 'August 7, 2026',
      img: '2024/02/Merger_Acquisition_AdobeStockImages_cropped-scaled-e1719243197230.jpg' }
  ];

  var CYBER = [
    { t: 'ESET turns MDR into a cyber resilience package',
      u: S + '/news/eset-turns-mdr-into-a-cyber-resilience-package',
      by: 'ChannelE2E Team', d: 'September 18, 2026', img: '2026/09/AdobeStock_546877400-copy-JB.jpg' },
    { t: 'Security-focused MSPs rethink cyber risk, AI and growth',
      u: S + '/news/security-ai-and-growth-strategies-for-msps',
      by: 'Anjali Fluker', d: 'September 10, 2026',
      img: '2026/09/CP-Defend-Alexandria_Lunch-2_AF-16x9-crop-downsized.jpeg' },
    { t: 'New Huntress and blueAPACHE deal means more ways to sell managed security',
      u: S + '/news/huntress-and-blueapache-expand-partnership-around-microsoft-security',
      by: 'ChannelE2E Team', d: 'September 8, 2026',
      img: '2023/08/partnership-meeting-two-people-executives-GettyImages-520791880-1.jpg' }
  ];

  var AI = [
    { t: '59% of companies leave AI agents outside identity controls',
      u: S + '/news/ai-agent-integration-lags-behind-adoption-creating-security-gaps',
      by: 'ChannelE2E Team', d: 'October 12, 2026', img: '2026/10/AdobeStock_2158687240.jpeg' },
    { t: 'Microsoft puts AI agents in security containers on Windows 11',
      u: S + '/news/microsoft-announces-new-ai-security-features-and-copilot-pcs',
      by: 'ChannelE2E Team', d: 'October 12, 2026', img: '2025/02/021125_microsoft.jpg' },
    { t: 'Extreme Networks sees growth with AI platform and channel partners',
      u: S + '/news/extreme-networks-sees-growth-with-ai-platform-and-channel-partners',
      by: 'ChannelE2E Team', d: 'October 6, 2026',
      img: '2026/09/wide_cinematic_corporate_business_scene_in_a_dark_100kb.jpg' }
  ];

  var WEBCAST = { t: 'Stop Selling Tools: How to Market Cybersecurity Customers Will Buy',
    u: S + '/webcast/stop-selling-tools-how-to-market-cybersecurity-customers-will-buy',
    when: 'Tue | 3 | 1:00 PM ET', month: 'November', day: '3', time: '1:00 PM ET',
    blurb: 'Cybersecurity may be one of the fastest-growing opportunities for MSPs, but it remains one of the hardest services to market effectively. Too many providers lead with technical tools, complicated terminology, or fear-based messaging that business leaders do not understand.' };

  return { thumb: thumb, site: S, LEAD: LEAD, TOP: TOP, PERSPECTIVES: PERSPECTIVES, BRIEFS: BRIEFS,
    CRA: CRA, GUEST: GUEST, LATEST: LATEST, MOSTREAD: MOSTREAD, MNA: MNA, CYBER: CYBER, AI: AI,
    WEBCAST: WEBCAST };
})();
