Object.values = Object.values || function(o){return Object.keys(o).map(function(k){return o[k]})};



function getKeyByValue(object, value) {
  //return Object.keys(object).find(key => object[key] === value);
        //console.log(value,object);
        for (key in object){
            if(parseFloat(object[key])===value)
                return key
        }
}


function getRowTable(arrParams,td,tr){
    res="<"+tr+">";
    for (var i in arrParams){
        res+="<"+td+">";
        if(arrParams[i] !== undefined)
            res+=arrParams[i];
        else
            res+="N/A";

        res+= "</"+td+">";
    }
    res+="</"+tr+">";
    return res;
}

function grafica(div,x,y ){
    var trace1 = {
  x: x,
  y: y,
  type: 'scatter'
};
var data = [trace1];

Plotly.newPlot(div, data);
}

function graficaDestacar(div,x,y,xdes,ydes,name ){
    var trace1 = {
  x: x,
  y: y,
  name : name,
  type: 'scatter'
};
    //console.log(xdes,ydes,x)
    var dest = {
    x: xdes,
    y: ydes,
    name: 'Maximo',
    type: 'scatter',
    mode: 'markers',
    marker: {
      size: 20
    }
  };
var data = [trace1,dest];

Plotly.newPlot(div, data);
}

function graficaDolar(div,DolarInter,Dolar,DolarInerCerr){
    var trace1 = {
  x: Object.keys(DolarInter),
  y: Object.values(DolarInter),
  type: 'scatter',
  name: 'Dolar Inerbancario Abertura'
};
    var trace2 = {
  x: Object.keys(Dolar),
  y: Object.values(Dolar),
  type: 'scatter',
  name: 'Dolar '
};
    var trace3 = {
  x: Object.keys(DolarInerCerr),
  y: Object.values(DolarInerCerr),
  type: 'scatter',
  name: 'Dolar Inerbancario Cierrre'
};
var data = [trace1,trace2,trace3];

Plotly.newPlot(div, data);
}


function getAvg(arr) {
    //console.log(arr);
    ac=0;
    for (var i in arr){
        ac+=parseFloat(arr[i])
    }
    return ac/arr.length
}
function getArray(json) {
    arr={};
    $.each(json,function (i,v) {
        arr[v.fecha]=v.dato
    });
    return arr;
}

function getRequest() {
    fecha1=$("#dateUdisIni").val();
    fecha2=$("#dateUdisFin").val();
    if(fecha1==="" || fecha2===""){
        alert("por favor seleccione una fecha");
        return;}
    if(new Date(fecha1) > new Date(fecha2)){
        alert("rango de fechas no valido");
        return;}
    console.log(fecha1);

    $.ajax({
        url: "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP68257,SF43718,SF43786,SF43787/datos/"+fecha1+"/"+fecha2+"?token="+apikey,
        //headers: {"Bmx-Token":"947cdcbd83a021036de6bace18980a8c89121325e7495224e893b5e77ff4efd7"},
        jsonp: "callback",
        dataType: "jsonp", //Se utiliza JSONP para realizar la consulta cross-site
        success: function (response) {  //Handler de la respuesta
            console.log(response.bmx.series);
            let datosudis; //= response.bmx.series[0].datos;
            let datosDolarInter; //= response.bmx.series[1].datos;
            let datosDolarSolv; //= response.bmx.series[2].datos;
            let datosDolarInterCerr; //= response.bmx.series[3].datos;

            $.each(response.bmx.series, function(i, v) {
                if (v.idSerie == "SP68257") {
                    datosudis = getArray(response.bmx.series[i].datos);
                }
                if (v.idSerie == "SF43718") {
                    datosDolarInter = getArray(response.bmx.series[i].datos);
                }
                if (v.idSerie == "SF43786") {
                    datosDolarSolv = getArray(response.bmx.series[i].datos);
                }
                if (v.idSerie == "SF43787") {
                    datosDolarInterCerr = getArray(response.bmx.series[i].datos);
                }
            });

            //Se carga una tabla con los registros obtenidos
            udis=Object.values(datosudis);
            grafica("divUdis",Object.keys(datosudis),udis);
            graficaDolar("divDol",datosDolarInter,datosDolarSolv,datosDolarInter);
            DolarInter=Object.values(datosDolarInter);
            DolarSolv=Object.values(datosDolarSolv);
            DolarInterCerr=Object.values(datosDolarInterCerr);

            $("#result").empty();
            reg=getRowTable(["Fecha",
                     "Udi",
                     "Interbancario a 48 horas Apertura compra",
                     "Dolar para solventar obligaciones denominadas en moneda extranjera"
                     ,"Interbancario a 48 horas Cierre venta",
                 ],"th","thead");
            //Promedios maximos y minimos
            reg+= getRowTable(["promedio",getAvg(udis).toFixed(3),getAvg(DolarInter).toFixed(3),getAvg(DolarSolv).toFixed(3),getAvg(DolarInterCerr).toFixed(3)],
                "td class='positive'","tr");
            reg+=getRowTable(["Maximo", Math.max.apply(Math, udis), Math.max.apply(Math, DolarInter),
                    Math.max.apply(Math, DolarSolv),Math.max.apply(Math, DolarInterCerr)],
                "td class='positive'","tr");
            reg+=getRowTable(["Minimo", Math.min.apply(Math, udis), Math.min.apply(Math, DolarInter),
                    Math.min.apply(Math, DolarSolv),Math.min.apply(Math, DolarInterCerr)],
                "td class='positive'","tr");

            //$("#result").append(reg);
            //reg="";
            for (var i in datosudis) {
                reg += getRowTable([i,datosudis[i],datosDolarInter[i],datosDolarSolv[i],datosDolarInterCerr[i]],"td","tr");
            }
            $("#result").append(reg);


        }
    });

}
