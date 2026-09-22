# Uncited claims

Generated 2026-09-22. A scan for numeric factual claims sitting on lines that carry no citation.

## Scope

Covers every rendered page except:

- `docs/aux/**` — productivity heuristics (the "law of π", the 75% planning rule, the maker's
  schedule). These are teaching devices, not empirical claims, and citing them as literature
  would be a category error.
- `draft: true` pages, which are pruned from the build.

Within a page, lines inside tables, code blocks, math, figure captions and headings are skipped,
as is any line already carrying a `[@citekey]` or an inline link.

## How to use this

**Category** is the kind of source that would settle the claim — that is what decides how to
chase it. A regulatory threshold needs a named guidance document; a prevalence needs an
epidemiological source; a transit time needs a reference text.

**Never attach a source that does not state the figure.** The ARC page had three claims whose
real sources said something materially different: a range reported as a point value, a
subgroup result generalised to a cohort, and an outcome claim the study explicitly refuted.
Those only surfaced because the numbers were checked against the abstract rather than the
citation being assumed from the author's name.

| Category | Claims | Settled by |
| :--- | ---: | :--- |
| Regulatory | 28 | ICH / FDA / EMA guidance |
| Regulatory & paediatric PK | 8 | ICH E11, FDA paediatric guidance, paediatric PK literature |
| Disease epidemiology | 52 | WHO, disease society, or primary epidemiology |
| Physiology / PK constant | 23 | PK textbook or primary physiology reference |
| Pharmacology | 1 | primary literature or product label |
| Software behaviour | 6 | software documentation or primary literature |
| **Total** | **118** | |


## Regulatory


**`docs/concepts/clinpharm-studies/ba-be/index.qmd`**

- **L31** — Both BE and relative BA studies share the same objective, design, and statistical analysis (comparing AUC and C~max~ via the geometric mean ratio (GMR) and its 90% CI).
- **L34** — **Relative BA**: GMR and 90% CI reported **without pre-defined boundaries** (effect estimation).
- **L35** — **Bioequivalence**: GMR and 90% CI must fall **within pre-defined boundaries** (generally 0.80--1.25).
- **L51** — 90% CI of the GMR (test/reference) for AUC and C~max~ must fall within **0.80--1.25**.
- **L57** — The ±20% threshold is based on the assumption that differences in systemic exposure smaller than 20% are not clinically significant for most drugs.
- **L64** — **Replicate design** for highly variable drugs (intra-subject CV >30%).
- **L68** — **Sampling**: ≥12 blood samples per subject; <20% of AUC extrapolated; adequate density around t~max~.
- **L78** — Fed condition: high-fat (~50% of calories), high-calorie (~800--1000 kcal) standardized meal; dose 30 minutes after start of meal.
- **L79** — Fasted condition: overnight fast ≥10 hours; water allowed until 1 hour before dosing.
- **L91** — Fed condition: high-calorie (~800--1000 kcal), high-fat (~50% of calories) standardized meal; dose 30 minutes after start of meal.

**`docs/concepts/clinpharm-studies/hepatic-impairment-studies/index.qmd`**

- **L12** — As a quantitative trigger: FDA recommends a study when hepatic metabolism and/or biliary excretion accounts for **>20%** of elimination of parent drug or active metabolite.

**`docs/concepts/clinpharm-studies/index.qmd`**

- **L119** — Common in Phase 2b; ≥12 months lead time required.
- **L174** — **Bioequivalence** (pivotal/post-approval): 90% CI of GMR within 0.80--1.25.
- **L196** — [Renal impairment (RI)](renal-impairment-studies/index.qmd) -- classified by GFR; required when f~e~ >30% (FDA), but even non-renally cleared drugs should consider severe RI. The mirror case, accelerated rather than reduced elimination, is [augmented renal clearance](../pk/augmented-renal-clearance/index.qmd).
- **L197** — [Hepatic impairment (HI)](hepatic-impairment-studies/index.qmd) -- classified by Child-Pugh (or NCI-ODWG in oncology); required when hepatic elimination >20% (FDA).

**`docs/concepts/clinpharm-studies/mass-balance/index.qmd`**

- **L24** — Must be started **≥12 months** ahead of planned dosing date due to radiolabel synthesis, pre-study activities, and limited CRO availability.
- **L31** — Synthesis and manufacture of the radioactive drug; stability and purity (>98%) assessment for at least 6 months.
- **L40** — Aim to recover **>90% of radioactivity**.
- **L42** — Stop collection when cumulative radioactivity in urine and feces is **<1% of administered dose** over a 24-hour period on 2 consecutive days.
- **L48** — Aim to characterize >80% of excreted radioactivity.
- **L49** — **Metabolites in Safety Testing (MIST)**: Identify metabolites contributing to **>10% of total plasma radioactivity** AUC.
- **L51** — Construct a **quantitative mass balance diagram** and **metabolic scheme** showing enzymes/transporters involved in pathways accounting for >25% of elimination.

**`docs/concepts/clinpharm-studies/qt/index.qmd`**

- **L44** — The threshold level of regulatory concern, is around **5 ms** as evidenced by an upper bound of the 95% confidence interval around the mean effect on QTc of **10 ms**
- **L45** — Drugs that prolong the mean QT/QTc interval by **>20 ms** have a substantially increased likelihood of being proarrhythmic
- **L53** — Upper bound of the two-sided **90% CI** for the mean difference vs. placebo must be **below 10 ms**.
- **L82** — 2 times maximal therapeutic exposure.

**`docs/concepts/clinpharm-studies/renal-impairment-studies/index.qmd`**

- **L8** — Fraction excreted unchanged in urine (f~e~) >30% (FDA).
- **L36** — This gives 80% power to detect ±40% change in exposure.

## Regulatory & paediatric PK


**`docs/concepts/pediatrics/index.qmd`**

- **L63** — When patients are very young (< 1 year after birth), age is often related to the mothers last menstrual period.
- **L71** — CGA is PNA reduced by the number of weeks born before 40 weeks of gestation (@eq-cga).
- **L194** — By converting to the standard `WT` of 70 kg and using standard exponent values, you rely on robust research when simulating outside adult data.
- **L208** — In lower ages (**< 2 years**), there are also maturation functions that come into play.
- **L252** — In such cases---typically for patients under 2 years of age---consider using growth charts.
- **L296** — If the drug is indicated to be used in the age range below one year, exposure vs body weight and age should be depicted in an additional separate figure focused on children 0--1 years.
- **L303** — The *blue line* is the median simulated pediatric C~ss~ and the *blue shaded area* encompasses 90% of the simulated pediatric patients.
- **L304** — The *horizontal gray band* encompasses 90% of the simulated adult patients receiving 100 mg BID.

## Disease epidemiology


**`docs/pathology-primers/autoimmune/giant-cell-arteritis/index.qmd`**

- **L21** — ~70% Females
- **L24** — 50% also diagnosed with polymyalgia rheumatica (PMR)

**`docs/pathology-primers/autoimmune/psoriasis/index.qmd`**

- **L26** — Commonly presents in adults aged 15–35 and 50–60 years
- **L28** — Worldwide prevalence approximately 2–3%
- **L51** — Mild: <3%, Moderate: 3–10%, Severe: >10%

**`docs/pathology-primers/autoimmune/rheumatoid-arthritis/index.qmd`**

- **L26** — 70% women
- **L33** — Duration of disease >= 6 weeks
- **L45** — Typical treatment, 33% response rate.

**`docs/pathology-primers/bacterial/bacterial-infection/index.qmd`**

- **L83** — The "right" treatment is 90% successful, and the "wrong" treatment is 60% successful (known as the **"90/60 rule"**).
- **L85** — Most infections can be treated in 5--7 days.
- **L112** — Treatment re-evaluation after 3 days
- **L113** — 48 hours needed to evaluate antibiotic efficacy
- **L115** — Empiric treatment should ideally be switched to targeted therapy once culture results are available (2--3 days)

**`docs/pathology-primers/bacterial/tuberculosis/index.qmd`**

- **L11** — About 25% of the global population is estimated to have been infected with TB bacteria.
- **L13** — About 7.5% of people infected with TB will eventually get symptoms and develop TB disease.
- **L14** — If left untreated, active TB disease kills around 50% of those affected.
- **L18** — People living with [HIV](../../viral/hiv/index.qmd) are ~16 times more likely to fall ill with TB disease than people without HIV.
- **L82** — Active pulmonary TB is treated with <span class="red-underline">**several antibiotics for a minimum of 6 months**</span>.
- **L93** — **2 months**: isoniazid, rifampicin, pyrazinamide, ethambutol (2HRZE)
- **L94** — **4 months**: isoniazid, rifampicin (4HR)
- **L96** — Such a regimen is also spelled as **2HRZE/4HR**, meaning 2 months of HRZE treatment followed by 4 months of HR treatment.
- **L106** — **6 months**: bedaquiline (J04AK05), pretomanid (J04AK08), linezolid (J01XX08), moxifloxacin (J01MA14) (BPaLM)
- **L108** — The second-line treatment contains bedaquiline, levofloxacin (J01MA12)/moxifloxacin, ethionamide (J04AD03), ethambutol, isoniazid, pyrazinamide and clofazimine (J04BA01) (all-oral regimen) administered for up to 9 months.
- **L122** — f~b~ ≈ 99%
- **L131** — F ≈ 100%
- **L147** — HL: 14--26 h
- **L148** — Food effect: AUC +88% (dosed with food)

**`docs/pathology-primers/cancer/lung-cancer/index.qmd`**

- **L10** — Small-cell lung cancer (SCLC) ~15% of cases
- **L11** — Non-small-cell lung cancer (NSCLC) ~85% of cases
- **L12** — Adenocarcinomas ~40% of cases
- **L13** — Squamous-cell carcinomas ~30% of cases
- **L14** — Large-cell carcinomas ~15% of cases

**`docs/pathology-primers/cancer/skin-cancer/index.qmd`**

- **L22** — Most common (~80% of skin cancers)
- **L26** — Medium frequency (~20% of skin cancers)
- **L31** — Least frequent (~1% of skin cancers)

**`docs/pathology-primers/diabetes/index.qmd`**

- **L29** — T1DM commonly presents in childhood or adolescence (<20 years), though adult-onset is possible.
- **L31** — T2DM is more prevalent, accounting for >90% of diabetes cases globally.
- **L46** — Fasting plasma glucose (FPG) ≥126 mg/dL (≥7.0 mmol/L)
- **L47** — 2-hour plasma glucose ≥200 mg/dL (≥11.1 mmol/L) after oral glucose tolerance test (OGTT)
- **L48** — HbA1c ≥6.5%
- **L49** — Random plasma glucose ≥200 mg/dL (≥11.1 mmol/L) with classical symptoms
- **L56** — Well-controlled: HbA1c <7%
- **L57** — Moderately controlled: HbA1c 7--8.5%
- **L58** — Poorly controlled: HbA1c >8.5%

**`docs/pathology-primers/neurological/alzheimer/index.qmd`**

- **L30** — Early-onset Alzheimer’s (<65 years) accounts for less than 5% of all cases.

**`docs/pathology-primers/neurological/parkinson/index.qmd`**

- **L27** — Typically affects individuals older than 60 years, though early-onset PD (<50 years) accounts for approximately 5–10% of cases. Slightly higher prevalence observed in males compared to females, with global prevalence around 1–2% among elderly populations.

**`docs/pathology-primers/neurological/schizophrenia/index.qmd`**

- **L29** — Schizophrenia commonly emerges during late adolescence to early adulthood (16--30 years).
- **L31** — Global prevalence is about 0.5--1%.

**`docs/pathology-primers/viral/hiv/index.qmd`**

- **L22** — Without treatment, the average survival time after infection with HIV is estimated to be 9--11 years, depending on the HIV subtype.
- **L36** — Among these, HIV-1 group M viruses are the **most prevalent, infecting nearly 90% of people living with HIV** ("M" for "major").
- **L67** — In most cases, people develop antibodies to HIV within 28 days of infection.
- **L69** — People who have had a recent high-risk exposure and test negative can have a further test after 28 days.

## Physiology / PK constant


**`docs/concepts/pk/1_absorption/index.qmd`**

- **L11** — Gastric emptying (2--5 hours)
- **L12** — Generally assumed as 2 hours.
- **L14** — Small intestine transit (2--6 hours)
- **L16** — Colonic transit (10--59 hours)
- **L20** — Whole gut transit (10--72 hours).
- **L58** — High solubility: highest single therapeutic dose dissolves in ≤250 mL aqueous media across pH 1.2--6.8 at 37°C.

**`docs/concepts/pk/2_distribution/index.qmd`**

- **L14** — $\Vd$ usually has 30% inter-individual variability.
- **L24** — Typical physiological valoumes for a 70 kg adult:
- **L26** — V~plasma~ ≈ 3 L
- **L27** — V~interstitial~ ≈ 12 L
- **L28** — V~water,\ extracellular~ ≈ 16 L
- **L29** — V~cells~ ≈ 27 L
- **L30** — V~water,\ total~ ≈ 42 L

**`docs/concepts/pk/3_elimination/index.qmd`**

- **L238** — However, differences appear at high GFR levels, especially when the values go above 150 mL/min/1.73 m^2^, a condition called augmented renal clearance.
- **L261** — In general, if the serum creatinine rises at 2--3 mg/dl per day then the GFR is near zero.

**`docs/concepts/pk/augmented-renal-clearance/index.qmd`**

- **L28** — That study split at 120 mL/min uncorrected rather than the body-surface-indexed threshold used here, and I am a co-author on it.
- **L35** — Note that study set the bar higher than the 130 mL/min/1.73 m^2^ used above, at >150 mL/min/1.73 m^2^ in women and >160 in men, so the 85% is against a stricter definition than this page's.
- **L38** — In the trauma patients it was initially higher than expected, 140 to 190 mL/min/1.73 m^2^, so 190 is the top of that early range rather than a typical value.

**`docs/concepts/pk/index.qmd`**

- **L487** — Females have ~15% lower kidney function than males.
- **L500** — However, adjustment may be warranted when the patient’s age deviates by more than 20 years from the typical reference age.
- **L505** — **Kidney function decreases by approximately 1% per year in adults.**
- **L516** — IBW = 50 kg + 2.3 kg for each inch over 5ft in height
- **L520** — IBW = 45.5 kg + 2.3 kg for each inch over 5ft in height

## Pharmacology


**`docs/pharmacopeia/atc/h/index.qmd`**

- **L10** — On 21 September 1948 at the Mayo Clinic, Charles Slocumb gave a woman crippled by rheumatoid arthritis 100 mg of Kendall's "compound E" (now known as **cortisone**), and within three days she was markedly improved.

## Software behaviour


**`docs/tools-of-the-trade/nonmem/nm-est/index.qmd`**

- **L859** — It starts the OMEGAs at 1.5 times the initial values, and then control the rate at which the OMEGAs shrink during each iteration.
- **L941** — Off-diagonals should therefore not be fixed to 0 just because of high RSEs (>100%) (as you would with FOCE).
- **L1078** — This corresponds to 5% for log-normally distributed parameters.

**`docs/tools-of-the-trade/nonmem/nm-qa/index.qmd`**

- **L27** — ETA ShrinkageSD < 20% ? (then we can use EBE based diagnostics)
- **L28** — EPS ShrinkageSD < 20% ? (then we can look at IPRED vs DV)
- **L105** — RSE% considered precise: < 30% for THETAs, < 50% for ETAs

---

## Probably not claims

Flagged as instructions, definitions or worked examples rather than assertions.
Listed for completeness; most need nothing.


**`docs/concepts/pediatrics/index.qmd`**

- **L70** — The convention for calculating GA when the date of conception is known is to add 2 weeks to the conceptional age.
- **L262** — Create 250 simulated male subjects and 250 female subjects in the same age-group (e.g., 12--18 years).

**`docs/concepts/pk/augmented-renal-clearance/index.qmd`**

- **L60** — Introduce a scalar above 130 mL/min.

---

Re-derive with: any line carrying a percentage, dose, duration, fold-change or
millisecond value and no `[@` on the same line, excluding `docs/aux/**` and drafts.
