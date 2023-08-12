export default class TileManager {

    // g is a list of detector counts, eps is a small number to avoid zero division errors
    constructor() {
        this.TileFeatures = []
        this.tileWiseFeatures = new Map();
        this.tileBoundaries = new Map();
        //Importance of each tile to be annotated. Lower the value higher the priority
        this.tileSamplePriorities = new Map();
        this.sampleIndexTilesMap = new Map();
        this.detectorCountsMap = null;
        this.tilesIndexInSortedOrder = new Map();
        this.markedCompletedTiles = new Map()
        this.samplesUpdatedCounts;
    }

    async loadDetectorCountsFile(file){
        try{
            let data = await file.text();

            this.detectorCountsMap = new Map()
            let lines  = data.split('\n')
            let tileNames = []
            for(let i = 1;i<lines.length;i++){
                let pair = lines[i].split(',')
                this.detectorCountsMap.set(pair[0],parseInt(pair[1]));
                tileNames.push(pair[0])
            }
            tileNames.sort();
            for(let idx=1;idx<tileNames.length;idx++){
                this.tilesIndexInSortedOrder.set(tileNames[idx],idx-1);
            }
            let detectorCountsArray = Array(tileNames.length-1).fill(0);
            for(let tileAndCount of this.detectorCountsMap){
                detectorCountsArray[this.tilesIndexInSortedOrder.get(tileAndCount[0])]=tileAndCount[1]
            }
            return detectorCountsArray;

        } catch{
            alert('Failed to load counts csv');
        }
    }

    async loadTilesFromFiles(files){
        let maxSampleIndex = -1
        for (let file of files) {
            if (file.name.toLowerCase().indexOf('.geojson') > -1) {
                try {
                    let data = await file.text()
                    let parsed = JSON.parse(data)
                    let tileName = file.name.split('.')[0]
                    if(parsed.indexes && parsed.indexes.length>0){
                        this.tileWiseFeatures.set(tileName,parsed.features);
                        this.tileBoundaries.set(tileName,parsed.features[0].properties.tile_bbox);
                        this.tileSamplePriorities.set(tileName,parsed.indexes)
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
    }

    getTileFeatures(tile){
        return this.tileWiseFeatures.get(tile);
    }

    getTileBoundaries(tile){
        return this.tileBoundaries.get(tile).split(',').map(parseFloat);
    }

    markTileComplete(tile, newShapes){
        this.markedCompletedTiles.set(tile,true);
        let newFeatures = [];
		for(let shape of newShapes){
			newFeatures.push(shape.data);
		}
		this.tileWiseFeatures.set(tile,newFeatures)
		for(let sampleIndex of this.tileSamplePriorities.get(tile)){
			this.samplesUpdatedCounts[sampleIndex]=newFeatures.length;
		}
    }

    getUpdatedTileIndicesAndCounts(){
        let updatedTileIndices = []
		let newCounts = []
        let totalSamples = this.samplesUpdatedCounts.length
		let idx = 0;
		while(idx<totalSamples && !isNaN(this.samplesUpdatedCounts[idx])){
			updatedTileIndices.push(this.tilesIndexInSortedOrder.get(this.sampleIndexTilesMap.get(idx)));
			newCounts.push(this.samplesUpdatedCounts[idx])
			idx++;
		}
        return [updatedTileIndices,newCounts];
    }

    getMarkedAndUnmarkedTiles(){
        let tiles = [... this.tileSamplePriorities.keys()]
        let incompleteTiles = []
		let completeTiles = []
        for(let tile of tiles){
			if(this.markedCompletedTiles.has(tile) && this.markedCompletedTiles.get(tile)==true){
				completeTiles.push(tile);
			}
			else{
				incompleteTiles.push(tile);
			}
		}
        let compFunction = (a,b)=>{
			try{
				if(Math.min(...this.tileSamplePriorities.get(a))<Math.min(...this.tileSamplePriorities.get(b))){
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


