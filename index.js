import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const company_name = process.argv[2];

// 各駅の降車人数ファイルを読み込み
const count_data = fs.readFileSync(`./exit_count_${company_name}.csv`);
const records = parse(count_data);

// 駅の位置情報（geojson）
const station_geojson = fs.readFileSync(`./${company_name}_station.geojson`);
let station = JSON.parse(station_geojson.toString());
let features = station.features

// 駅の位置情報に各駅の乗車人数を返す
let count_features = features.flatMap((feature) => {
    const counts = records.filter( record => record[0] == feature.properties.N05_011);
    if (counts.length == 0) {
        return [];
    }
    
    feature.properties.count = parseInt(counts[0][3]);
    return feature
});

// 重複を削除
const filter_count_features = count_features.filter((x, i, features) => {
    return features.findIndex(feature => feature.properties.N05_011 === x.properties.N05_011) === i;
});

// debug
console.log(filter_count_features.length);

// feturesを更新
station.features = filter_count_features;

// 書き出し
const output_geojson = JSON.stringify(station, null, '  ');
fs.writeFileSync(`${company_name}_station_count.geojson`, output_geojson);