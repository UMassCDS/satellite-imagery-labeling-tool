export default class kDisCount {

    // g is a list of detector counts, eps is a small number to avoid zero division errors
    constructor(g, eps=4e-2) {
        if (Math.min(...g) == 0) {
            g = g.map(x => x + eps);
        }

        this.g = g;
        const sum = g.reduce((a, b) => a + b, 0);
        this.q = g.map(x => x / sum);
        this.regions = [Array.from({ length: g.length }, (_, idx) => [idx])]
    }


    // sampleIndexes is the indexes of the annotated samples, trueCounts are the corresponding true counts annotated by the labeller
    load(sampleIndexes, trueCounts) {
        this.samples = []
        this.f = Array(this.g.length).fill(NaN);
        sampleIndexes.forEach((el, i) => {
            this.f[el] = trueCounts[i];
            this.samples.push(i);
        });
    }

    // estimate the counts for each region, by default all tiles are considered in one region only
    estimate(regions=null, ciAllSamples=false) {
        if (regions == null) {
            regions = this.regions;
        }
       const fHat = [], cI = [];
        regions.forEach((r, i) => {
            const s = this.samples.filter(x => r.includes(x));
            const gS = r.map(x => this.g[x]).reduce((a, b) => a + b, 0);
            if (s.length == 0) {
                fHat.push(0);
                cI.push(0);
                return;
            }

            let wBar = 0;
            s.forEach((el, j) => {
                console.log(el, this.f[el], this.g[el]);
                wBar += (this.f[el] / this.g[el]);
            });

            const fHatI = gS * (wBar / s.length);

            let wCi = 0;
            let sCi;
            if (ciAllSamples) {
                sCi = this.samples;
            }
            else {
                sCi = s;
            }

            sCi.forEach((el, j) => {
                wCi += (((gS * this.f[el]) / this.g[el]) - fHatI) ** 2;
            });

            const varHat = wCi / sCi.length;
            fHat.push(fHatI);
            cI.push(1.96 * Math.sqrt(varHat / sCi.length));
        });
        return { fHat, cI };
    }
}


