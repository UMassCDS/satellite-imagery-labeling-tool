export default class TileManager {

    // g is a list of detector counts, eps is a small number to avoid zero division errors
    constructor() {
        this.tileBoundaries = new Map();
        this.sampleIndexTilesMap = new Map();
        this.detectorCountsMap = null;
        this.tilesIndexInDetectionsArray = new Map();
        this.samplesUpdatedCounts;
        this.tileInfo = new Map();
        this.annotationsFileLoaded = false;
    }

    async loadDetectorCountsFile(file){
        try{
            let data = await file.text();

            this.detectorCountsMap = new Map()
            let lines  = data.split('\n')
            let detectorCountsArray = [];
            for(let i = 1;i<lines.length;i++){
                // first line is the titles of columns. Hence i starts from 1
                let pair = lines[i].split(',')
                if(pair.length>=2){
                    // sometimes last line is just a new line character.
                    // Therefore this if condition.
                    let tileName = pair[0];let detectionCount = parseInt(pair[1])
                    this.detectorCountsMap.set(tileName,detectionCount);
                    detectorCountsArray.push(detectionCount);
                    this.tilesIndexInDetectionsArray.set(tileName,i-1)
                }
            }
            this.annotationsFileLoaded = true;
            return detectorCountsArray;

        } catch{
            alert('Failed to load counts csv');
        }
    }

    async loadTilesFromFiles(files){
        if(!this.annotationsFileLoaded){
            alert('Annotations csv not loaded');
            return false;
        }
        let maxSampleIndex = -1
        for (let file of files) {
            if (file.name.toLowerCase().indexOf('.geojson') > -1) {
                try {
                    let data = await file.text()
                    let parsed = JSON.parse(data)
                    let tileName = file.name.split('.')[0]
                    this.tileInfo.set(tileName,parsed);
                    if(parsed.indexes && parsed.indexes.length>0){
                        this.tileBoundaries.set(tileName,parsed.features[0].properties.tile_bbox);
                        for(let sampleIdx of parsed.indexes){
                            this.sampleIndexTilesMap.set(sampleIdx,tileName)
                        }
                        maxSampleIndex = Math.max(maxSampleIndex,...parsed.indexes)
                    }
                } catch (e) {
                    alert('Unable to load data file.');
                }
            }
        };
        this.samplesUpdatedCounts = Array(maxSampleIndex+1).fill(NaN);
        return true;
    }

    getTileFeatures(tile){
        return this.tileInfo.get(tile).features;
    }

    getTileBoundaries(tile){
        return this.tileBoundaries.get(tile).split(',').map(parseFloat);
    }

    markTileComplete(tile, newShapes){
        this.tileInfo.get(tile).annotated = true;
        let newFeatures = [];
		for(let shape of newShapes){
			newFeatures.push(shape.data);
		}
        this.tileInfo.get(tile).features=newFeatures;
		for(let sampleIndex of this.tileInfo.get(tile).indexes){
			this.samplesUpdatedCounts[sampleIndex]=newFeatures.length;
		}
    }

    getUpdatedTileIndicesAndCounts(){
        let updatedTileIndices = []
		let newCounts = []
        let totalSamples = this.samplesUpdatedCounts.length
		let idx = 0;
		while(idx<totalSamples && !isNaN(this.samplesUpdatedCounts[idx])){
			updatedTileIndices.push(this.tilesIndexInDetectionsArray.get(this.sampleIndexTilesMap.get(idx)));
			newCounts.push(this.samplesUpdatedCounts[idx])
			idx++;
		}
        return [updatedTileIndices,newCounts];
    }

    getMarkedAndUnmarkedTiles(){
        let tiles = [... this.tileBoundaries.keys()]
        let incompleteTiles = []
		let completeTiles = []
        for(let tile of tiles){
			if(this.tileInfo.get(tile).annotated){
				completeTiles.push(tile);
			}
			else{
				incompleteTiles.push(tile);
			}
		}
        let compFunction = (a,b)=>{
			try{
				if(Math.min(...this.tileInfo.get(a).indexes)<Math.min(...this.tileInfo.get(b).indexes)){
					return -1;
				}
				else{
					return 1;
				}
			} catch(e){
				return 0;
			}
		}
        incompleteTiles.sort(compFunction);
		completeTiles.sort(compFunction);
        return [incompleteTiles,completeTiles];
    }

}


