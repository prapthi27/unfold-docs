import { AudienceMode, AudienceOption, GlossaryItem } from '@/types';

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    id: 'layperson',
    label: 'Layperson',
    tagline: 'Plain Conversational English',
    description: 'Everyday clear language eliminating legalese, latinisms, and obscure jargon.',
    readingGrade: 'Grade 7-8',
  },
  {
    id: 'high_school',
    label: 'High School Student',
    tagline: 'Accessible & Educational',
    description: 'Relatable phrasing and helpful context analogies suited for high school reading.',
    readingGrade: 'Grade 9-10',
  },
  {
    id: 'non_native',
    label: 'Non-Native Speaker',
    tagline: 'Simple, Direct & International',
    description: 'Concise sentences, common vocabulary, and active voice for ESL readers.',
    readingGrade: 'Grade 5-6',
  },
];

export const SAMPLE_ORIGINAL_DOCUMENT = `SECTION 14.8 — INDEMNIFICATION, SERVICE LEVEL DEFICIENCIES, AND LIMITATION OF LIABILITY

Except as explicitly set forth in Subsection 14.8.2 herein, Licensor shall defend, indemnify, and hold harmless Licensee, its affiliates, directors, officers, and employees against any third-party claims, liabilities, losses, damages, and reasonable attorneys' fees arising out of any material breach of confidentiality or intellectual property infringement under this Master Services Agreement dated October 12, 2024.

Notwithstanding any contrary provision, Licensor's aggregate monetary liability under this Agreement shall in no event exceed the lesser of $50,000 USD or the total fees paid by Licensee during the preceding six (6) month period.

In the event Licensor fails to maintain the guaranteed 99.9% Monthly Availability Threshold (a "Service Level Deficiency"), Licensee must submit written notification within thirty (30) calendar days of the calendar month end. Failure to deliver such notice shall constitute an irrevocable waiver of any right to Service Credits. Liquidated damages shall be calculated at 5.0% of the Monthly Recurring Fee per cumulative hour of unscheduled downtime, capped at a maximum of 25% of the applicable monthly billing cycle. Neither party shall be liable for indirect, punitive, or consequential damages arising hereunder.`;

export const SAMPLE_SIMPLIFICATIONS: Record<AudienceMode, string> = {
  layperson: `### Plain-English Translation (Audience: Layperson)

**1. Lawsuit Defense & Protection**
If someone sues your company claiming our software copied their work (intellectual property) or leaked confidential data, we will hire lawyers and pay court costs to defend you under our contract dated **October 12, 2024**.

**2. Financial Payout Limit (Liability Cap)**
Even if we make a severe mistake, the absolute most money we will pay you is capped at either **$50,000 USD** or whatever total amount you paid us over the past **6 months** — whichever amount is smaller.

**3. Uptime Guarantee (99.9%)**
We guarantee that the software service will stay online at least **99.9%** of each calendar month.

**4. Strict 30-Day Deadline for Refund Credits**
If our service drops below 99.9%, you have **30 calendar days** after month-end to notify us in writing. If you miss this deadline, you permanently give up your right to any bill credits.

**5. How Your Refund is Calculated**
For every cumulative hour our system is unexpectedly down, you get **5.0%** off your monthly bill, up to a maximum credit of **25%** for that month.`,

  high_school: `### Educational Breakdown (Audience: High School Student)

**Think of this section as the terms of a warranty with strict rules:**

- **Court Costs Covered:** If a third party sues you because our software infringed someone else's copyright under the agreement dated **October 12, 2024**, our company will pay your legal defense fees.
- **Spending Ceiling:** The highest monetary amount we can ever be forced to pay is **$50,000 USD** or what you paid in fees during the last **6 months** (whichever number is lower).
- **Service Standard:** We commit to keeping the platform running **99.9%** of the time.
- **30-Day Notice Rule:** If there's an outage, you must send an official written claim within **30 calendar days** after the month ends. If you don't submit it in time, the credit is lost.
- **Damage Compensation:** For each hour the service goes dark, you receive a **5.0%** discount on your bill, with a maximum cap of **25%** for that month.`,

  non_native: `### Direct & Simple Guide (Audience: Non-Native English Speaker)

**Summary of Rules:**

- **Lawsuit help:** We protect you if another person sues you about copyright. This applies to the contract signed on **October 12, 2024**.
- **Maximum money limit:** The highest money we will pay you is **$50,000 USD** or the total fees you paid us in the past **6 months**. We pay whichever number is lower.
- **Online promise:** The software will work **99.9%** of the time every month.
- **Important 30-day deadline:** If the service stops working, you must send us a letter or email within **30 calendar days** after the month finishes. If you do not write in time, you will not receive any refund credit.
- **Refund calculation:** You receive a **5.0%** refund for each hour of unexpected system stop. The maximum refund is **25%** of that month's bill.`,
};

export const SAMPLE_KEY_TAKEAWAYS: Record<AudienceMode, string[]> = {
  layperson: [
    'We defend you and pay legal fees if third parties sue you over confidentiality breaches or IP issues under the October 12, 2024 agreement.',
    'Total liability is capped at $50,000 USD or your past 6 months of paid fees, whichever is lower.',
    'The service guarantees a 99.9% monthly availability threshold.',
    'Written claim for downtime credits must be delivered within 30 calendar days of month-end, or credits are waived forever.',
    'Downtime refunds equal 5.0% of monthly fee per hour of outage, up to a strict 25% monthly cap.',
  ],
  high_school: [
    'Legal Shield: We cover lawyer costs if you are sued over copyright infringement from our October 12, 2024 agreement.',
    'Payout Cap: The maximum payout is limited to $50,000 USD or the last 6 months of paid fees.',
    'Uptime Standard: Service is promised to run 99.9% of every calendar month.',
    '30-Day Clock: You must submit a written claim within 30 days after month-end or lose all rights to credits.',
    '5% Discount per Hour: Downtime grants a 5.0% fee credit per hour, maxing out at 25% for the month.',
  ],
  non_native: [
    'Lawsuit Support: We pay lawyer costs if you get sued regarding copyright under the October 12, 2024 agreement.',
    'Maximum Money: The most money we can pay you is $50,000 USD or your last 6 months of fees (whichever is less).',
    'Uptime Promise: The system stays active 99.9% of each month.',
    '30-Day Notification: You must send written notice within 30 days after the month ends to receive money back.',
    'Hour Refund: You receive a 5.0% credit per outage hour, capped at 25% of that month\'s bill.',
  ],
};

export const SAMPLE_GLOSSARY: GlossaryItem[] = [
  {
    term: 'Indemnify & Hold Harmless',
    definition: 'A legal commitment to protect you and pay your financial losses, damages, and legal defense fees if someone sues you.',
  },
  {
    term: 'Limitation of Liability',
    definition: 'A contractual cap specifying the maximum dollar amount one party can ever be forced to pay to the other in damages.',
  },
  {
    term: 'Service Level Deficiency',
    definition: 'A failure to meet guaranteed performance standards, such as falling below the 99.9% monthly online availability target.',
  },
  {
    term: 'Irrevocable Waiver',
    definition: 'Permanently and irreversibly giving up a legal right or claim (such as bill credits) by failing to act before a deadline.',
  },
  {
    term: 'Liquidated Damages',
    definition: 'A predetermined, formulaic financial compensation (like a 5% discount per hour of downtime) agreed upon in the contract.',
  },
];
