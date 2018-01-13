var tests = [
{
	txt: "中国中國中國館國中",
	kws: ['a', 'b', '中国']
},
{
	txt: '【文匯網訊】據新華社報道，國務院總理李克強當地時間6日晚在萬象下榻飯店會見新加坡總理李顯龍。李克強表示，新加坡是中國在本地區的重要合作夥伴。兩國領導人保持密切溝通，有利於維護中新關係發展方向，促進務實合作，增進雙方人民感情，更好實現互利共贏。',
	kws: ['克', '李克强', '社保', '報導', '【', '克', '克強']
},
{
	txt: '香港上市公司商會舉辦「上市監管諮詢論壇」，邀請業界代表就有關諮詢，發表意見，證監會及港交所均無派員出席。',
	kws: ['香港', '意见', '邀请', '。']
},
{
	txt: '之後，中國與東盟友好合作不斷提質升級。目前，中國——東盟自貿區已經建成，升級議定書也已生效。新建立的瀾滄江——湄公河合作機制為深化中國與東盟合作、縮小東盟內部發展差距提供了新動力。中國已成為東盟最大的貿易夥伴之一，是東盟最大的遊客來源國。',
	kws: ['zhongguo', '目前', '已生肖', '。','生效', '中国']
},
{
	txt: '【本報駐北京記者鐵怡七日電】北京市政府新聞辦與北京市文物局昨天聯合舉辦“讓走進博物館成為一種生活方式”新聞發佈會。據了解，故宮博物院秋季將再推《故宮藏歷代書畫展》；首都博物館秋季將推出“燕京八絕”、“大元三都”和“故宮養心殿”三大展覽，展覽將持續至明年春節前後。',
	kws: ['《故宫', '】】', '】', '政府', '联合']
},
{
	txt: '“一雲”即雲端數據中心，為城市建設融合、開放、安全的雲端數據中心。“二網”即城市通信網和城市物聯網。“三平台”包括ICT能力開放平台、大數據服務支撐平台、業務應用使能平台。',
	kws: ['“yi”', '“一云', '二网', 'ICT', '、', '数据中心', '業務']
}
];

for (var i=0;i<tests.length;i++){
	document.writeln(Chinese.highlightKeywords(tests[i]['txt'], tests[i]['kws'])+'<br>');
}