var $ = function (id) {return document.getElementById(id);};
        var worker, charts = {}, LAST = null, SPOT = {};
        var FLOOR = 'pct', CAP = 'pct';
        var SUBMIT = {sp: 100, bd: 0, gd: 0};
        var ASSETS = [
            {id: 'sp500_price', name: 'S&P 500 Index', ticker: '^GSPC', group: 'S&P 500', sleeve: 'sp', years: '1928+', note: 'headline large-cap index'},
            {id: 'sp500_total_return', name: 'S&P 500 Total Return', ticker: '^SP500TR', group: 'S&P 500', sleeve: 'sp', years: '1988+', note: 'dividends included where available'},
            {id: 'sp500_equal_weight', name: 'S&P 500 Equal Weight', ticker: 'RSP', group: 'S&P 500', sleeve: 'sp', years: '2003+', note: 'large-cap equal-weight proxy'},
            {id: 'sp500_growth', name: 'S&P 500 Growth', ticker: 'IVW', group: 'S&P 500', sleeve: 'sp', years: '2000+', note: 'growth tilt'},
            {id: 'sp500_value', name: 'S&P 500 Value', ticker: 'IVE', group: 'S&P 500', sleeve: 'sp', years: '2000+', note: 'value tilt'},
            {id: 'sp500_quality', name: 'S&P 500 Quality', ticker: 'SPHQ', group: 'S&P 500', sleeve: 'sp', years: '2005+', note: 'quality factor proxy'},
            {id: 'sp500_momentum', name: 'S&P 500 Momentum', ticker: 'SPMO', group: 'S&P 500', sleeve: 'sp', years: '2015+', note: 'momentum factor proxy'},
            {id: 'sp500_dividend_aristocrats', name: 'Dividend Aristocrats', ticker: 'NOBL', group: 'S&P 500', sleeve: 'sp', years: '2013+', note: 'dividend growers'},
            {id: 'sp500_sector_technology', name: 'Technology', ticker: 'XLK', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_financials', name: 'Financials', ticker: 'XLF', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_health_care', name: 'Health Care', ticker: 'XLV', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_consumer_discretionary', name: 'Consumer Discretionary', ticker: 'XLY', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_consumer_staples', name: 'Consumer Staples', ticker: 'XLP', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_industrials', name: 'Industrials', ticker: 'XLI', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_energy', name: 'Energy', ticker: 'XLE', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_materials', name: 'Materials', ticker: 'XLB', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_utilities', name: 'Utilities', ticker: 'XLU', group: 'S&P 500 sectors', sleeve: 'sp', years: '1998+', note: 'sector proxy'},
            {id: 'sp500_sector_real_estate', name: 'Real Estate Sector', ticker: 'XLRE', group: 'S&P 500 sectors', sleeve: 'sp', years: '2015+', note: 'sector proxy'},
            {id: 'total_us_market_vti', name: 'Total U.S. Market', ticker: 'VTI', group: 'Full-market indexes', sleeve: 'sp', years: '2001+', note: 'broad equity proxy'},
            {id: 'total_us_market_itot', name: 'S&P Total U.S. Market', ticker: 'ITOT', group: 'Full-market indexes', sleeve: 'sp', years: '2004+', note: 'broad equity proxy'},
            {id: 'russell_3000_iwv', name: 'Russell 3000', ticker: 'IWV', group: 'Full-market indexes', sleeve: 'sp', years: '2000+', note: 'broad equity proxy'},
            {id: 'wilshire_5000_yahoo', name: 'Wilshire 5000', ticker: '^W5000', group: 'Full-market indexes', sleeve: 'sp', years: '1988+', note: 'broad market index'},
            {id: 'us_reit_vnq', name: 'U.S. REITs', ticker: 'VNQ', group: 'REITs', sleeve: 'sp', years: '2004+', note: 'mapped to equity sleeve for now'},
            {id: 'us_reit_iyr', name: 'U.S. Real Estate', ticker: 'IYR', group: 'REITs', sleeve: 'sp', years: '2000+', note: 'mapped to equity sleeve for now'},
            {id: 'global_reit_vnqi', name: 'Global ex-U.S. REITs', ticker: 'VNQI', group: 'REITs', sleeve: 'sp', years: '2010+', note: 'mapped to equity sleeve for now'},
            {id: 'total_bond_market_bnd', name: 'Total Bond Market', ticker: 'BND', group: 'Bonds', sleeve: 'bd', years: '2007+', note: 'mapped to Treasury sleeve'},
            {id: 'ten_year_treasury_yield', name: '10-Year Treasury', ticker: 'DGS10', group: 'Bonds', sleeve: 'bd', years: '1962+', note: 'Treasury bond model'},
            {id: 'gold_gld', name: 'Gold ETF', ticker: 'GLD', group: 'Gold', sleeve: 'gd', years: '2004+', note: 'gold sleeve'},
            {id: 'gold_futures_yahoo', name: 'Gold Futures', ticker: 'GC=F', group: 'Gold', sleeve: 'gd', years: '2000+', note: 'gold sleeve'},
            {id: 'developed_ex_us_efa', name: 'Developed ex-U.S.', ticker: 'EFA', group: 'International', sleeve: 'sp', years: '2001+', note: 'mapped to equity sleeve for now'},
            {id: 'emerging_markets_eem', name: 'Emerging Markets', ticker: 'EEM', group: 'International', sleeve: 'sp', years: '2003+', note: 'mapped to equity sleeve for now'}
        ];
        var PORTFOLIO = [{id: 'sp500_price', weight: 100}];

        function clamp(v, lo, hi) {return v < lo ? lo : (v > hi ? hi : v);}
        function money(v) {return '$' + Math.round(v).toLocaleString('en-US');}
        function moneyK(v) {
            if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
            if (Math.abs(v) >= 1000) return '$' + Math.round(v / 100) / 10 + 'k';
            return '$' + Math.round(v);
        }
        function pct(v, d) {return (v * 100).toFixed(d === undefined ? 1 : d) + '%';}
        function fmt6(v) {return (Math.round(v * 1e6) / 1e6).toLocaleString('en-US', {maximumFractionDigits: 6});}
        function median(a) {var s = a.slice().sort(function (p, q) {return p - q;}); return s[Math.floor(s.length / 2)];}
        function passLabel(r) {
            if (r.n_pass >= r.n_windows) return '100%';
            var s = (r.n_pass / r.n_windows * 100).toFixed(1);
            if (s === '100.0') s = '99.9';
            return s + '%';
        }
        function assetById(id) {
            for (var i = 0; i < ASSETS.length; i++) if (ASSETS[i].id === id) return ASSETS[i];
            return null;
        }
        function esc(s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
            });
        }
        function portfolioSleeves() {
            var out = {sp: 0, bd: 0, gd: 0, total: 0};
            for (var i = 0; i < PORTFOLIO.length; i++) {
                var a = assetById(PORTFOLIO[i].id), w = Math.max(0, parseFloat(PORTFOLIO[i].weight) || 0);
                if (!a) continue;
                out[a.sleeve] += w; out.total += w;
            }
            return out;
        }
        function renderSources() {
            var groups = [], seen = {};
            for (var i = 0; i < ASSETS.length; i++) if (!seen[ASSETS[i].group]) {seen[ASSETS[i].group] = 1; groups.push(ASSETS[i].group);}
            var html = '';
            for (var g = 0; g < groups.length; g++) {
                html += '<div class="source-group"><h3>' + esc(groups[g]) + '</h3><div class="source-list">';
                for (var j = 0; j < ASSETS.length; j++) {
                    var a = ASSETS[j];
                    if (a.group !== groups[g]) continue;
                    var on = PORTFOLIO.some(function (p) {return p.id === a.id;});
                    html += '<button type="button" class="source-pill' + (on ? ' on' : '') + '" data-add="' + a.id + '">'
                        + esc(a.name) + ' <span class="tnum">' + esc(a.ticker) + '</span></button>';
                }
                html += '</div></div>';
            }
            $('sourceGroups').innerHTML = html;
        }
        function renderPortfolio() {
            var html = '';
            if (!PORTFOLIO.length) html = '<div class="note"><b>No holdings yet.</b> Pick one or more sources on the left, or use a preset below.</div>';
            for (var i = 0; i < PORTFOLIO.length; i++) {
                var p = PORTFOLIO[i], a = assetById(p.id);
                if (!a) continue;
                html += '<div class="alloc-row"><div><div class="asset-name">' + esc(a.name) + '</div>'
                    + '<div class="asset-meta">' + esc(a.ticker) + ' · ' + esc(a.years) + ' · ' + esc(a.note) + '</div></div>'
                    + '<div class="inputrow"><input type="number" class="hassuf alloc-input" aria-label="Allocation for ' + esc(a.name) + '" data-id="' + a.id + '" value="'
                    + esc(p.weight) + '" min="0" max="100" step="1"><span class="suf">%</span></div>'
                    + '<button type="button" class="remove-asset" data-remove="' + a.id + '" aria-label="Remove ' + esc(a.name) + '">×</button></div>';
            }
            $('allocList').innerHTML = html;
            updatePortfolioModelSummary();
            renderSources();
        }
        function updatePortfolioModelSummary() {
            var s = portfolioSleeves(), total = s.total || 0;
            $('mixTotal').textContent = Math.round(total * 10) / 10 + '%';
            $('mixBar').innerHTML = '<span class="mix-sp" style="width:' + (total ? s.sp / total * 100 : 0) + '%"></span>'
                + '<span class="mix-bd" style="width:' + (total ? s.bd / total * 100 : 0) + '%"></span>'
                + '<span class="mix-gd" style="width:' + (total ? s.gd / total * 100 : 0) + '%"></span>';
            $('inAllocSp').value = s.sp; $('inAllocBond').value = s.bd; $('inAllocGold').value = s.gd;
            $('sleeveNote').innerHTML = '<b>Model mix:</b> ' + Math.round(s.sp) + '% equity sleeve, '
                + Math.round(s.bd) + '% bond sleeve, ' + Math.round(s.gd) + '% gold sleeve.';
            updateAllocNote();
        }
        function addAsset(id) {
            for (var i = 0; i < PORTFOLIO.length; i++) if (PORTFOLIO[i].id === id) return;
            PORTFOLIO.push({id: id, weight: 0}); renderPortfolio();
        }
        function setPreset(name) {
            if (name === 'sp500') PORTFOLIO = [{id: 'sp500_price', weight: 100}];
            else if (name === 'balanced') PORTFOLIO = [{id: 'total_us_market_vti', weight: 60}, {id: 'ten_year_treasury_yield', weight: 40}];
            else if (name === 'threeway') PORTFOLIO = [{id: 'total_us_market_vti', weight: 70}, {id: 'ten_year_treasury_yield', weight: 20}, {id: 'gold_gld', weight: 10}];
            else PORTFOLIO = [];
            renderPortfolio();
        }
        function updateAllocNote() {
            var sp = parseFloat($('inAllocSp').value) || 0,
                bd = parseFloat($('inAllocBond').value) || 0,
                gd = parseFloat($('inAllocGold').value) || 0;
            var sum = sp + bd + gd, msg = '';
            if (Math.abs(sum - 100) > 0.5)
                msg += '<b>Heads up:</b> your mix adds to ' + (Math.round(sum * 10) / 10)
                    + '% — it will be rescaled to total 100%. ';
            if (gd > 0)
                msg += 'Including gold limits the simulation to <b>1968–2023</b> — gold was pegged by the '
                    + 'gold standard before then. That shorter span leaves out the 1929 and 1907 crashes, '
                    + 'so results can look safer than a full-history test would show.';
            else
                msg += 'Simulation window: the full embedded <b>1871–2023</b> stock/bond history.';
            $('allocNote').innerHTML = msg;
        }
        function allocPhrase() {
            var s = SUBMIT.sp + SUBMIT.bd + SUBMIT.gd; if (s <= 0) s = 1;
            var parts = [];
            for (var i = 0; i < PORTFOLIO.length; i++) {
                var a = assetById(PORTFOLIO[i].id), w = parseFloat(PORTFOLIO[i].weight) || 0;
                if (a && w > 0) parts.push(Math.round(w / s * 100) + '% ' + a.name);
            }
            return parts.join(', ') || '100% U.S. stocks';
        }

        if (window.Chart) {
            Chart.defaults.font.family = "'Inter',system-ui,sans-serif";
            Chart.defaults.font.size = 11; Chart.defaults.color = '#666a7b';
        }

        var FHINT = {
            pct: 'A share of your savings &mdash; it rises and falls with your balance, so the account can never be fully drained.',
            usd: 'A fixed monthly income, inflation-protected. Predictable &mdash; but in a long downturn it forces selling, which can wear the account down.',
            both: 'Each month you withdraw whichever is larger: the percentage of savings, or the fixed dollar amount.'
        };
        var CHINT = {
            pct: 'A maximum withdrawal rate. The withdrawal can climb toward it after strong markets, but never past it.',
            usd: 'A fixed dollar ceiling. However well markets do, you never withdraw more than this each month.',
            both: 'Two ceilings at once &mdash; each month you withdraw no more than the smaller of the percentage and the dollar amount.'
        };
        function setFloor(m) {
            FLOOR = m;
            var bs = $('segFloor').querySelectorAll('button');
            for (var i = 0; i < bs.length; i++) bs[i].className = (bs[i].dataset.m === m) ? 'on' : '';
            $('hintFloor').innerHTML = FHINT[m];
            $('f_pct').style.display = (m === 'pct') ? '' : 'none';
            $('f_usd').style.display = (m === 'pct') ? 'none' : '';
            $('f_pctfloor').style.display = (m === 'both') ? '' : 'none';
        }
        function setCap(m) {
            CAP = m;
            var bs = $('segCap').querySelectorAll('button');
            for (var i = 0; i < bs.length; i++) bs[i].className = (bs[i].dataset.m === m) ? 'on' : '';
            $('hintCap').innerHTML = CHINT[m];
            $('c_pct').style.display = (m === 'usd') ? 'none' : '';
            $('c_usd').style.display = (m === 'pct') ? 'none' : '';
        }

        function initWorker() {
            var src = $('worker-src').textContent;
            worker = new Worker(URL.createObjectURL(new Blob([src], {type: 'text/javascript'})));
            worker.onmessage = onMessage;
        }

        function runCalc() {

            var years = clamp(parseFloat($('inYears').value) || 30, 5, 100);
            var minA = clamp(parseFloat($('inMinA').value) || 4, 4, 10);
            var nestEgg = Math.max(1000, parseFloat($('inNest').value) || 1000000);
            var retain = clamp(parseFloat($('inRetain').value) || 100, 0, 300);
            var dollarFloor = Math.max(0, parseFloat($('inDollar').value) || 0);
            var pctFloor = clamp(parseFloat($('inPctFloor').value) || 4, 0, 12);
            var pctCap = clamp(parseFloat($('inCapPct').value) || 9, 0.5, 40);
            var dollarCap = Math.max(0, parseFloat($('inCapDollar').value) || 0);
            var lookback = clamp(Math.round(parseFloat($('inLookback').value) || 1), 1, 120);
            var recalc = clamp(Math.round(parseFloat($('inRecalc').value) || 1), 1, 120);
            var aSp = Math.max(0, parseFloat($('inAllocSp').value) || 0);
            var aBd = Math.max(0, parseFloat($('inAllocBond').value) || 0);
            var aGd = Math.max(0, parseFloat($('inAllocGold').value) || 0);
            if (aSp + aBd + aGd <= 0) {aSp = 100; $('inAllocSp').value = 100;}
            SUBMIT = {sp: aSp, bd: aBd, gd: aGd};
            $('inLookback').value = lookback; $('inRecalc').value = recalc;
            $('loading').className = 'show'; $('results').className = '';
            var fast = (FLOOR === 'pct' && CAP === 'pct' && recalc === 1);
            var startText = aGd > 0 ? '1968' : '1871';
            $('loadtext').textContent = fast
                ? 'Replaying your retirement through every modeled period since ' + startText + '…'
                : 'Running a full month-by-month simulation of every modeled retirement since ' + startText + '… (a few seconds)';
            setTimeout(function () {
                worker.postMessage({
                    type: 'run', floorMode: FLOOR, capMode: CAP, years: years,
                    minA: minA, dollarFloor: dollarFloor, pctFloor: pctFloor, pctCap: pctCap,
                    dollarCap: dollarCap, lookback: lookback, recalc: recalc,
                    nestEgg: nestEgg, retain: retain, wSp: aSp, wBond: aBd, wGold: aGd
                });
            }, 30);
        }

        function onMessage(ev) {
            var m = ev.data;
            if (m.type === 'result') {
                LAST = m; $('loading').className = ''; $('results').className = 'show'; renderAll(m);
            } else if (m.type === 'spotlight') {renderSpotlight(m.traj);}
        }

        function floorVal(m) {
            var b = m.best;
            if (m.mode.floor === 'pct') return fmt6(b.aPct) + '%';
            return money(b.D) + '/mo';
        }
        function capVal(m) {
            var b = m.best;
            if (m.mode.cap === 'pct') return fmt6(b.bPct) + '%';
            return money(b.C) + '/mo';
        }
        function timingSentence(L, F) {
            var look = (L === 1) ? "the prior month’s market return"
                : "the market’s total return over the prior " + L + " months";
            var rec = (F === 1) ? "Every month" : "Every " + F + " months";
            return rec + " the strategy looks at " + look + " and sets your withdrawal from it"
                + ((F > 1) ? " — holding it fixed in between" : "") + ".";
        }

        function renderAll(m) {
            var b = m.best, rows = m.rows;
            if (!rows || !rows.length) {
                $('headline').innerHTML = 'There isn’t enough market history for a ' + (m.W / 12)
                    + '-year retirement with this portfolio. Shorten the retirement length, reduce lookback/recalculation timing, '
                    + 'or remove sources that shorten the modeled history.';
                $('dialrow').innerHTML = ''; $('summary').innerHTML = ''; $('tiles').innerHTML = '';
                $('tbody').innerHTML = ''; $('frontier').innerHTML = ''; $('tableSub').textContent = '';
                destroy('inc'); destroy('pre'); destroy('spot');
                return;
            }
            var N = rows.length;
            var fy = rows.map(function (r) {return r.firstYearReal;});
            var av = rows.map(function (r) {return r.avgAnnualReal;});
            var fyMedMo = median(fy) / 12, avMedMo = median(av) / 12;
            var nFail = rows.filter(function (r) {return !r.passed;}).length;
            var passStr = (b.n_pass >= b.n_windows) ? 'every one' : passLabel(b);
            var nest = parseFloat($('inNest').value), years = m.W / 12;
            var firstYear = rows[0].start.slice(0, 4);

            $('headline').innerHTML = 'On your ' + money(nest) + ' in savings, you could safely '
                + 'withdraw about <b>' + money(fyMedMo) + ' / month</b> to start &mdash; and this plan kept '
                + 'your money intact in <b>' + passStr + '</b> of the ' + N
                + ' modeled retirements simulated since ' + firstYear + '.';

            var fHint = (m.mode.floor === 'pct') ? 'lowest yearly rate'
                : (m.mode.floor === 'usd') ? 'guaranteed every month'
                    : 'or ' + fmt6(b.aPct) + '%/yr — larger wins';
            var cHint = (m.mode.cap === 'pct') ? 'highest yearly rate'
                : (m.mode.cap === 'usd') ? 'monthly ceiling'
                    : 'or ' + fmt6(b.bPct) + '%/yr — smaller wins';
            $('dialrow').innerHTML =
                dchip('Floor (a)', floorVal(m), fHint) +
                dchip('Cap (b)', capVal(m), cHint) +
                dchip('Sensitivity (x)', fmt6(b.x), 'tuned by the calculator') +
                dchip('Goal met', passLabel(b), b.n_pass + ' of ' + b.n_windows + ' periods', true);

            var floorWord = (m.mode.floor === 'pct') ? ('a floor of ' + fmt6(b.aPct) + '% of savings')
                : (m.mode.floor === 'usd') ? ('a floor of ' + money(b.D) + ' per month')
                    : ('a floor of whichever is larger: ' + money(b.D) + '/month or ' + fmt6(b.aPct) + '% of savings');
            var capWord = (m.mode.cap === 'pct') ? ('a cap of ' + fmt6(b.bPct) + '% per year')
                : (m.mode.cap === 'usd') ? ('a cap of ' + money(b.C) + ' per month')
                    : ('a cap of whichever is smaller: ' + money(b.C) + '/month or ' + fmt6(b.bPct) + '%/year');
            var failNote = (nFail === 0) ? 'Not one of those retirements ran short of your goal.'
                : ('The ' + nFail + ' that fell short are highlighted in the table below — they began right '
                    + 'before history’s worst crashes. Lowering your cap, raising your floor’s safety, '
                    + 'or easing your retention goal removes them.');
            $('summary').innerHTML =
                '<p>With a portfolio of <b>' + allocPhrase() + '</b>, the calculator tested this plan against <b>'
                + N + ' separate retirements</b> — one starting in every month from ' + rows[0].start.slice(0, 4)
                + ' onward with ' + years + ' years of market history after it.</p>'
                + '<p>Each month you withdraw between ' + floorWord + ' and ' + capWord + '. '
                + timingSentence(m.L, m.F) + ' The sensitivity <b>x = ' + fmt6(b.x) + '</b> — chosen by the '
                + 'calculator — sets how sharply the withdrawal swings between your floor and cap.</p>'
                + '<p>In <b>' + passStr + '</b> of those retirements, your savings still met your goal of keeping <b>'
                + Math.round(m.target * 100) + '%</b> of their inflation-adjusted value after ' + years + ' years. '
                + failNote + '</p>'
                + '<p>These figures are a <b>ceiling</b>. In any month you can simply take what you actually '
                + 'need to spend — spending less only makes your savings safer.</p>';

            var worst = rows[0]; for (var i = 0; i < rows.length; i++) if (rows[i].endRatio < worst.endRatio) worst = rows[i];
            var fySort = fy.slice().sort(function (p, q) {return p - q;});
            $('tiles').innerHTML =
                tile('Typical starting income', money(fyMedMo) + '/mo',
                    'median first-year withdrawal across history (range ' + moneyK(fySort[0] / 12) + '–'
                    + moneyK(fySort[fySort.length - 1] / 12) + '/mo)') +
                tile('Average income over retirement', money(avMedMo) + '/mo',
                    'withdrawals climb over time as the same percentage is taken from a growing balance') +
                tile('Toughest retirement', pct(worst.endRatio, 0) + ' left',
                    'the hardest case in history — began ' + worst.start
                    + (nFail ? (' · ' + nFail + ' periods missed the goal') : ' · every period met the goal'));

            renderIncome(rows); renderPreserve(rows, m.target); renderTable(rows);
            renderFrontier(m.frontier, m.mode); populateSpot(rows);
        }

        function dchip(l, v, h, goal) {
            return '<div class="dchip' + (goal ? ' goal' : '') + '"><div class="l">' + l + '</div>'
                + '<div class="v tnum">' + v + '</div><div class="h">' + h + '</div></div>';
        }
        function tile(l, v, h) {
            return '<div class="tile"><div class="l">' + l + '</div><div class="v tnum">' + v
                + '</div><div class="h">' + h + '</div></div>';
        }

        function renderFrontier(fr, mode) {
            var h = '<table><thead><tr><th>Goal met</th><th>Floor</th><th>Cap</th><th>x</th>'
                + '</tr></thead><tbody>';
            fr.forEach(function (r) {
                var fl = (mode.floor === 'pct') ? r.aPct.toFixed(2) + '%' : money(r.D) + '/mo';
                var cp = (mode.cap === 'pct') ? r.bPct.toFixed(2) + '%' : money(r.C) + '/mo';
                h += '<tr><td>' + passLabel(r) + '</td><td>' + fl + '</td><td>' + cp + '</td><td>'
                    + Math.round(r.x) + '</td></tr>';
            });
            $('frontier').innerHTML = h + '</tbody></table>';
        }

        function destroy(n) {if (charts[n]) {charts[n].destroy(); charts[n] = null;} }
        function axes(yT, yF) {
            return {
                responsive: true, maintainAspectRatio: false, animation: false,
                interaction: {mode: 'index', intersect: false},
                scales: {
                    x: {
                        title: {display: true, text: 'Retirement start date'}, grid: {display: false},
                        border: {display: false}, ticks: {maxTicksLimit: 13, autoSkip: true}
                    },
                    y: {
                        title: {display: true, text: yT}, grid: {color: '#eef0f3'}, border: {display: false},
                        ticks: {callback: function (v) {return yF(v);}}
                    }
                },
                plugins: {
                    legend: {labels: {boxWidth: 9, boxHeight: 9, usePointStyle: true, font: {size: 11.5}}},
                    tooltip: {callbacks: {title: function (it) {return 'Retired ' + it[0].label;}}}
                }
            };
        }
        function renderIncome(rows) {
            destroy('inc');
            charts.inc = new Chart($('cIncome'), {
                type: 'line',
                data: {
                    labels: rows.map(function (r) {return r.start;}), datasets: [
                        {
                            label: 'Average monthly income', data: rows.map(function (r) {return Math.round(r.avgAnnualReal / 12);}),
                            borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.12)', borderWidth: 1.7,
                            pointRadius: 0, fill: true, tension: .15
                        },
                        {
                            label: 'First-year monthly income', data: rows.map(function (r) {return Math.round(r.firstYearReal / 12);}),
                            borderColor: '#0e9f6e', backgroundColor: 'rgba(14,159,110,.10)', borderWidth: 1.7,
                            pointRadius: 0, fill: true, tension: .15
                        }]
                },
                options: axes('Withdrawal ($ / month, today’s $)', moneyK)
            });
        }
        function renderPreserve(rows, target) {
            destroy('pre');
            charts.pre = new Chart($('cPreserve'), {
                type: 'line',
                data: {
                    labels: rows.map(function (r) {return r.start;}), datasets: [
                        {
                            label: 'Savings remaining (% of start)',
                            data: rows.map(function (r) {return +(r.endRatio * 100).toFixed(1);}),
                            borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.10)', borderWidth: 1.7,
                            fill: true, tension: .15,
                            pointRadius: rows.map(function (r) {return r.passed ? 0 : 3.2;}),
                            pointBackgroundColor: rows.map(function (r) {return r.passed ? 'transparent' : '#e0245e';}),
                            pointBorderColor: rows.map(function (r) {return r.passed ? 'transparent' : '#e0245e';})
                        },
                        {
                            label: 'Your goal (' + Math.round(target * 100) + '%)',
                            data: rows.map(function () {return target * 100;}),
                            borderColor: '#9aa0b0', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false
                        }]
                },
                options: axes('Inflation-adjusted savings left', function (v) {return v + '%';})
            });
        }
        function renderTable(rows) {
            var nFail = rows.filter(function (r) {return !r.passed;}).length;
            $('tableSub').textContent = rows.length + ' retirement periods tested. '
                + (nFail === 0 ? 'Every one met your goal.' : nFail + ' fell short (highlighted red).');
            var h = '';
            for (var i = 0; i < rows.length; i++) {
                var r = rows[i];
                h += '<tr class="' + (r.passed ? '' : 'fail') + '"><td>' + r.start + '</td><td>' + r.end + '</td><td>'
                    + money(r.firstYearReal / 12) + '/mo</td><td>' + money(r.avgAnnualReal / 12) + '/mo</td><td>'
                    + (r.endRatio * 100).toFixed(0) + '%</td><td><span class="pill ' + (r.passed ? 'y' : 'n') + '">'
                    + (r.passed ? 'met' : 'short') + '</span></td></tr>';
            }
            $('tbody').innerHTML = h;
        }
        function populateSpot(rows) {
            var o = '';
            for (var i = 0; i < rows.length; i++)
                o += '<option value="' + rows[i].s + '">' + rows[i].start + ' – ' + rows[i].end + '</option>';
            $('spotSel').innerHTML = o;

            var worst = rows[0], best = rows[0];
            for (var j = 0; j < rows.length; j++) {
                if (rows[j].endRatio < worst.endRatio) worst = rows[j];
                if (rows[j].endRatio > best.endRatio) best = rows[j];
            }
            SPOT = {worst: worst.s, best: best.s, typ: rows[Math.floor(rows.length / 2)].s};
            selectSpot(worst.s);

        }
        function selectSpot(s) {$('spotSel').value = s; worker.postMessage({type: 'spotlight', s: +s});}
        function renderSpotlight(t) {
            destroy('spot');
            charts.spot = new Chart($('cSpot'), {
                type: 'line',
                data: {
                    labels: t.labels, datasets: [
                        {
                            label: 'Portfolio value', yAxisID: 'y',
                            data: t.realValue.map(function (v) {return Math.round(v);}),
                            borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.12)', borderWidth: 1.9,
                            pointRadius: 0, fill: true, tension: .15
                        },
                        {
                            label: 'Monthly income allowed', yAxisID: 'y1',
                            data: t.realWithdrawal.map(function (v) {return Math.round(v / 12);}),
                            borderColor: '#0e9f6e', borderWidth: 1.7, pointRadius: 0, fill: false, tension: .15
                        }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, animation: false,
                    interaction: {mode: 'index', intersect: false},
                    scales: {
                        x: {grid: {display: false}, border: {display: false}, ticks: {maxTicksLimit: 12, autoSkip: true}},
                        y: {
                            position: 'left', title: {display: true, text: 'Portfolio value (today’s $)'},
                            grid: {color: '#eef0f3'}, border: {display: false},
                            ticks: {callback: function (v) {return moneyK(v);}}
                        },
                        y1: {
                            position: 'right', title: {display: true, text: 'Income ($ / month)'},
                            grid: {display: false}, border: {display: false},
                            ticks: {callback: function (v) {return moneyK(v);}}
                        }
                    },
                    plugins: {legend: {labels: {boxWidth: 9, boxHeight: 9, usePointStyle: true, font: {size: 11.5}}}}
                }
            });
        }

        $('segFloor').addEventListener('click', function (e) {
            if (e.target.dataset && e.target.dataset.m) setFloor(e.target.dataset.m);
        });
        $('segCap').addEventListener('click', function (e) {
            if (e.target.dataset && e.target.dataset.m) setCap(e.target.dataset.m);
        });
        $('runBtn').addEventListener('click', runCalc);
        $('spotSel').addEventListener('change', function () {selectSpot(this.value);});
        $('bWorst').addEventListener('click', function () {selectSpot(SPOT.worst);});
        $('bBest').addEventListener('click', function () {selectSpot(SPOT.best);});
        $('bTyp').addEventListener('click', function () {selectSpot(SPOT.typ);});

        $('sourceGroups').addEventListener('click', function (e) {
            var b = e.target.closest('[data-add]');
            if (b) addAsset(b.dataset.add);
        });
        $('allocList').addEventListener('input', function (e) {
            if (!e.target.dataset || !e.target.dataset.id) return;
            for (var i = 0; i < PORTFOLIO.length; i++) {
                if (PORTFOLIO[i].id === e.target.dataset.id) PORTFOLIO[i].weight = Math.max(0, parseFloat(e.target.value) || 0);
            }
            updatePortfolioModelSummary();
        });
        $('allocList').addEventListener('click', function (e) {
            if (!e.target.dataset || !e.target.dataset.remove) return;
            PORTFOLIO = PORTFOLIO.filter(function (p) {return p.id !== e.target.dataset.remove;});
            renderPortfolio();
        });
        document.querySelector('.preset-row').addEventListener('click', function (e) {
            if (e.target.dataset && e.target.dataset.preset) setPreset(e.target.dataset.preset);
        });
        setFloor('pct'); setCap('pct'); renderPortfolio();
        initWorker(); runCalc();
