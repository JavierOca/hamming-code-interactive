function decimalToReversedBinaryString(decimal) {
    // Convierto el numero decimal a cadena binaria
    let binaryString = decimal.toString(2);
    
    // Revierto la cadena binaria
    let reversedBinaryString = binaryString.split('').reverse().join('');
    
    return reversedBinaryString;
}

function calculateParityBits(dataLength, flag) {
    let p = 0;
    if (flag == 0){
        while (Math.pow(2, p) < (dataLength + p + 1)) {
            p++;
        }
        return p;
    }else{
        while (Math.pow(2, p) < (dataLength + p)) {
            p++;
        }
        return p - 1;
    }
}

// Actualizo la tabla existente para mostrar los bits de paridad calculados
function updateTableWithParityBits(bits, parityBitColors, modifyTable) {
    let table = document.getElementById("hamming-table");

    if (modifyTable == 1){
        table = document.getElementById("decoded-hamming-table");
    }

    // Creo una nueva fila para la secuencia completa de bits
    let fullBitRowElement = document.createElement("tr");

    // Agregar cada bit a la nueva fila
    bits.reverse().forEach((bit, index) => {
        let td = document.createElement("td");
        td.innerText = bit; // Pongo el valor del bit en la celda
        td.classList.add("bold-bit"); // Pongo en negrita para que se distinga mejor

        // Busco las posiciones de los bits de paridad de derecha a izquierda, para coincidir con la tabla
        let reversedIndex = bits.length - 1 - index; // Revierto el indice
        if ((reversedIndex + 1) && (Math.log2(reversedIndex + 1) % 1 === 0)) {
            td.style.backgroundColor = parityBitColors[reversedIndex];  // Le pongo color de fondo a las celdas con bits de paridad
        }

        fullBitRowElement.appendChild(td);
    });

    // Agrego la fila a la tabla
    table.appendChild(fullBitRowElement);
}

function calculateAndPlaceParityBits(bits, parityRows, parityBitColors, modifyTable) {
    // Itero en cada fila de paridad
    parityRows.forEach((parityRow, index) => {
        // Cuento la cantidad de unos en la fila de paridad actual
        let onesCount = parityRow.reduce((count, bit) => count + (bit === '1' ? 1 : 0), 0);

        // Determine the parity bit: 1 if onesCount is odd, 0 if even
        let parityBit = onesCount % 2 === 0 ? '0' : '1';

        // Coloco el bit de paridad calculado en la posicion apropiada en la lista de bits
        bits[Math.pow(2, index) - 1] = parityBit;
    });

    // Actualizo la tabla para reflejar los bits de paridad calculados
    updateTableWithParityBits(bits, parityBitColors, modifyTable);
}

function generateParityRows(bits, totalLength, modifyTable) {
    let table = document.getElementById("hamming-table");

    if (modifyTable == 1){
        table = document.getElementById("decoded-hamming-table");
    }
    
    let parityRows = [];
    let parityBitColors = [];

    // Itero a lo largo de cada indice de paridad
    for (let parityIndex = 0; parityIndex < Math.ceil(Math.log2(totalLength + 1)); parityIndex++) {
        let parityRow = new Array(totalLength).fill('');
        let parityPosition = Math.pow(2, parityIndex); // Posicion de bit de paridad: 1, 2, 4, 8...
        
        for (let i = 0; i < totalLength; i++){
            let reversedBinary = decimalToReversedBinaryString(i+1);
            if (reversedBinary[parityIndex] == 1 && bits[i] !== ''){  // Solo agrego bits en las posiciones que no son de paridad
                parityRow[i] = bits[i];
            }
        }

        parityRows.push(parityRow.reverse());

        let parityRowElement = document.createElement("tr");

        // Pongo color de fondo a cada celda basado en su contenido
        let colors = ["#add8e6", "#ffb6c1", "#d3f9a3", "#fdd6a7", "#c9daf8"];  // Arreglo de filas de colores

        let rowColor = colors[parityIndex % colors.length]; // Consigo el color para esta fila

        parityBitColors[parityPosition - 1] = rowColor; // Guardo el color para la posicion del bit de paridad
        
        let rowIndex = table.rows.length;  // Consigo el indice de la fila siendo agregada

        // Agrega celdas por cada item en la fila de paridad
        parityRow.forEach((cell, cellIndex) => {
            let td = document.createElement("td");
            td.innerText = cell;
            td.classList.add("bold-bit"); // Negrita

            // Si la celda no esta vacia, aplico el color de fondo
            if (cell !== '') {
                td.style.backgroundColor = colors[(rowIndex + 1) % colors.length];  // Ciclo entre colores
            }

            parityRowElement.appendChild(td);  // Agrego la celda a la fila
        });

        table.appendChild(parityRowElement);
    }
    calculateAndPlaceParityBits(bits, parityRows, parityBitColors, modifyTable);
}

function generateHammingMatrix() {
    
    let inputData = document.getElementById("data-input").value;
    
    // Controlo si es una cadena binaria
    if (!/^[01]+$/.test(inputData)) {
        let outputText = document.getElementById("output-text-encode");
        outputText.innerHTML = `<h3>La cadena ingresada no es binaria</h3>`;
        let table = document.getElementById("hamming-table");
        table.innerHTML = ''; // Borro el contenido de la tabla
        return; // Freno la ejecucion si la entrada es invalida
    }
    
    let dataLength = inputData.length;

    let reversedInput = inputData.split('').reverse().join('');

    // Calculo la cantidad de bits de paridad requeridos
    let parityBits = calculateParityBits(dataLength, 0);
    let totalLength = dataLength + parityBits;

    // Creo un arreglo vacio para los bits
    let bits = new Array(totalLength).fill('');

    // Inserto bits en las posiciones correspondientes
    let dataIndex = 0;
    for (let i = 0; i < totalLength; i++) {
        // Me salteo todas las posiciones potencias de 2 (bits de paridad)
        if (Math.pow(2, Math.floor(Math.log2(i + 1))) !== i + 1) {
            bits[i] = reversedInput[dataIndex] || '';
            dataIndex++;
        }
    }

    // Genero la primera fila con titulos
    let headerRow = [];
    for (let i = 1; i <= totalLength; i++) {
        if (Math.pow(2, Math.floor(Math.log2(i))) === i) {
            headerRow.push('P' + (Math.log2(i) + 1));
        } else {
            headerRow.push('B' + (i - headerRow.filter(val => val[0] === 'P').length));
        }
    }

    // Invierto la primera fila para que quede bien en la matriz
    headerRow.reverse();

    // Genero la matriz con la primera fila
    let table = document.getElementById("hamming-table");
    table.innerHTML = ''; // Borro el contenido previo

    // Creo la fila
    let headerRowElement = document.createElement("tr");
    headerRow.forEach(header => {
        let th = document.createElement("th");
        th.innerText = header;
        headerRowElement.appendChild(th);
    });
    table.appendChild(headerRowElement);

    // Agrego una fila para numerar las columnas
    let numberingRowElement = document.createElement("tr");
    for (let i = totalLength; i > 0; i--) {
        let td = document.createElement("td");
        td.innerText = i;
        numberingRowElement.appendChild(td);
    }
    table.appendChild(numberingRowElement);

    // Agrego una fila para la numeracion binaria
    let binaryRowElement = document.createElement("tr");
    let maxDigits = totalLength.toString(2).length; // Calculo el numero maximo de bits
    for (let i = totalLength; i > 0; i--) {
        let td = document.createElement("td");
        td.innerText = (i).toString(2).padStart(maxDigits, '0'); // Convierto el numero a binario
        binaryRowElement.appendChild(td);
    }
    table.appendChild(binaryRowElement);

    // Invierto el orden de los bits para poner los bits de paridad al final
    bits.reverse();

    // Creo la fila con los bits en el orden invertido
    let bitRowElement = document.createElement("tr");
    bits.forEach(bit => {
        let td = document.createElement("td");
        td.innerText = bit;
        td.classList.add("row-bit"); // Negrita
        bitRowElement.appendChild(td);
    });
    table.appendChild(bitRowElement);

    generateParityRows(bits.reverse(), totalLength, 0);

    // Muestro los resultados de la tabla
    let outputText = document.getElementById("output-text-encode");

    // Muestro la cadena de paridad y la cadena codificada
    
    let showParityBits = [];

    bits.reverse();
    // Itero a lo largo de cada posicion de bits en el arreglo
    for (let i = 0; i < bits.length; i++) {
        // Veo si la posicion actual es potencia de 2
        if ((i & (i + 1)) === 0) {
            showParityBits.push(bits[i]);
        }
    }

    // Agrego el arreglo de bits de paridad a la cadena
    let parityString = `Cadena de Paridad: ${showParityBits.reverse().join('')}`; // Invierto para que coincida con el orden de la matriz

    bits.reverse();
    let correctedString = `Cadena codificada: ${bits.join('')}`;

    outputText.innerHTML = `
        <h3>Resultados:</h3>
        <h2 class="center-text">${correctedString}</h2>
        <h2 class="center-text">${parityString}</h2>
    `;

    //Pueblo automaticamente el campo de texto del decodificador
    document.getElementById("received-input").value = bits.join('');

    // Itero en todas las filas
    let rows = table.querySelectorAll("tr");

    rows.forEach((row, rowIndex) => {

        let cells = row.querySelectorAll("td");

        // Resalto las filas de numeracion
        if (rowIndex === 1) {
            cells.forEach(cell => {
                cell.style.backgroundColor = "#E6E6FA";
            });
        }

        if (rowIndex === 2) {
            cells.forEach(cell => {
                cell.style.backgroundColor = "#F0FFF0";
            });
        }
    });

    // Referencia al contenedor de la descripcion de los colores
    let colorDescriptions = document.getElementById("color-descriptions-encode");

    // Limpio cualquier descripcion previa
    colorDescriptions.innerHTML = '';

    // Agrego descripciones dinamicamente
    let descriptionData = [
        { color: '#E6E6FA', text: 'Numeración Decimal' },
        { color: '#F0FFF0', text: 'Numeración Binaria' }
    ];

    descriptionData.forEach(item => {
        let description = document.createElement('span');
        description.style.display = 'inline-block';
        description.style.marginRight = '15px';

        // Agrego la caja de color
        let colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '5px';
        colorBox.style.border = '1px solid black';
        colorBox.style.verticalAlign = 'middle';

        // Agrego la descripcion
        let text = document.createElement('span');
        text.innerText = item.text;

        // Adjunto a la descripcion
        description.appendChild(colorBox);
        description.appendChild(text);

        // Adjunto al contenedor
        colorDescriptions.appendChild(description);
    });

    // Agrego explicacion adicional
    let additionalText = document.createElement('span');
    additionalText.style.display = 'inline-block';
    additionalText.style.marginLeft = '15px'; // Separacion de las descripciones
    additionalText.style.fontWeight = 'bold';
    additionalText.innerText = 'P: Bit de Paridad, B: Bit de Cadena'; // Texto explicativo

    colorDescriptions.appendChild(additionalText);

    // Muestro el contenedor de descripciones
    colorDescriptions.style.display = 'block';
}


function decodeHammingCode(){

    let receivedData = document.getElementById("received-input").value;

    // Controlo si es una cadena binaria
    if (!/^[01]+$/.test(receivedData)) {
        let outputText = document.getElementById("output-text-decode");
        outputText.innerHTML = `<h3>La cadena ingresada no es binaria</h3>`;
        let table = document.getElementById("decoded-hamming-table");
        table.innerHTML = ''; // Borro el contenido de la tabla
        return; // Freno la ejecucion si la entrada es invalida
    }

    let dataLength = receivedData.length;

    let reversedReceivedData = receivedData.split('').reverse().join('');

    // Calculo la cantidad de bits de paridad requeridos
    let parityBits = calculateParityBits(dataLength, 1);

    // Creo un arreglo vacio para los bits
    let bits = new Array(dataLength).fill('');

    // Inserto los bits recibidos en el arreglo
    let dataIndex = 0;
    for (let i = 0; i < dataLength; i++) {
        bits[i] = reversedReceivedData[dataIndex] || '';
        dataIndex++;
    }

    bits.reverse();

    // Creo la primera fila con titulos
    let headerRow = [];
    for (let i = 1; i <= dataLength; i++) {
        if (Math.pow(2, Math.floor(Math.log2(i))) === i) {
            headerRow.push('P' + (Math.log2(i) + 1));
        } else {
            headerRow.push('B' + (i - headerRow.filter(val => val[0] === 'P').length));
        }
    }

    // Invierto la primera fila para que quede bien en la matriz
    headerRow.reverse();

    // Genero la matriz
    let table = document.getElementById("decoded-hamming-table");
    table.innerHTML = ''; // Limpio la tabla
    
    // Creo la fila con titulos
    let headerRowElement = document.createElement("tr");
    headerRow.forEach(header => {
        let th = document.createElement("th");
        th.innerText = header;
        headerRowElement.appendChild(th);
    });
    table.appendChild(headerRowElement);

    // Fila para numeracion decimal
    let numberingRowElement = document.createElement("tr");
    for (let i = dataLength; i > 0; i--) {
        let td = document.createElement("td");
        td.innerText = i;
        numberingRowElement.appendChild(td);
    }
    table.appendChild(numberingRowElement);

    // Fila para numeracion binaria
    let binaryRowElement = document.createElement("tr");
    let maxDigits = dataLength.toString(2).length; // Calculo el numero maximo de bits
    for (let i = dataLength; i > 0; i--) {
        let td = document.createElement("td");
        td.innerText = (i).toString(2).padStart(maxDigits, '0'); // Convierto el numero a binario
        binaryRowElement.appendChild(td);
    }
    table.appendChild(binaryRowElement);

    // Fila para bits decodificados
    let bitRowElement = document.createElement("tr");
    bits.forEach(bit => {
        let td = document.createElement("td");
        td.innerText = bit;
        td.classList.add("row-bit"); // Negrita
        bitRowElement.appendChild(td);
    });
    table.appendChild(bitRowElement);

    generateParityRows(bits.reverse(), dataLength, 1);

    // Muestro los resultados de la tabla
    let outputText = document.getElementById("output-text-decode");

    // Cadena de bits de paridad y cadena decodificada
    
    let showParityBits = [];

    bits.reverse();

    for (let i = 0; i < bits.length; i++) {
        
        if ((i & (i + 1)) === 0) {
            showParityBits.push(bits[i]);
        }
    }

    // Arreglo a cadena
    let parityString = showParityBits.reverse().join('');
    let errorPosition = parseInt(parityString, 2);

    let errorInfo = `Hay un error en el bit numero: ${errorPosition}`;

    if (errorPosition == 0){
        errorInfo = `No hay error`;
    }
    if (errorPosition > bits.length){
        errorInfo = `Hay mas de un error.`;
    }

    // Corrijo el bit erroneo

    let indexToCorrect = errorPosition - 1;  // Ajusto para indice base 0

    // Invierto el bit erroneo
    bits[indexToCorrect] = bits[indexToCorrect] === '0' ? '1' : '0';

    // Elimino los bits de paridad
    let dataBits = bits.filter((bit, index) => {
        return (Math.log2(index + 1) % 1) !== 0;
    });

    // Arreglo a cadena
    const originalDataString = dataBits.reverse().join('');

    bits.reverse();
    let correctedBitsInfo = `Cadena Decodificada: ${originalDataString}`;

    // Resalto el bit corregido
    let correctedString = bits.map((bit, index) => {
        // Invierto el indice
        let reversedIndex = bits.length - index - 1;

        if (reversedIndex === indexToCorrect && errorPosition !== 0 && errorPosition <= bits.length) {
            return `<span style="color: red; font-weight: bold;">${bit}</span>`;
        }
        return bit;
    }).join('');

    if(errorPosition > bits.length){
        correctedBitsInfo = `Cadena Decodificada: ${correctedString}`;
    }

    // Filas de la tabla: la primera fila es indice 0, la numeracion decimal indice 1, la numeracion binaria indice 2
    // La fila de bits es indice 3
    let errorIndex = dataLength - errorPosition; // Convierto a indice base-0 (en orden invertido)

    // Itero en todas las filas
    let rows = table.querySelectorAll("tr");

    rows.forEach((row, rowIndex) => {

        let cells = row.querySelectorAll("td");

        // Resalto las filas de numeracion
        if (rowIndex === 1) {
            cells.forEach(cell => {
                cell.style.backgroundColor = "#E6E6FA";
            });
        }

        if (rowIndex === 2) {
            cells.forEach(cell => {
                cell.style.backgroundColor = "#F0FFF0";
            });
        }

        // Me salteo las primeras filas
        if (rowIndex > 2) {
            

            if (0 < cells.length ){
                // Me aseguro de que errorIndex esta dentro de los limites
                if (errorIndex >= 0 && errorIndex < cells.length) {
                    let cell = cells[errorIndex];

                    // Me fijo si la celda tiene texto para resaltarla
                    if (cell.innerText.trim() !== "") {
                        cell.style.backgroundColor = "red"; // Resalto
                        cell.style.color = "white"; // Cambio el color de la letra
                    }
                }
            }
        }
    });

    outputText.innerHTML = `
        <h3>Resultados:</h3>
        <h3>Cadena de Paridad: ${parityString}</h3>
        <h3>Cadena Corregida: ${correctedString}</h3>
        <h2 class="center-text">${errorInfo}</h2>
        <h2 class="center-text">${correctedBitsInfo}</h2>
    `;

    // Referencia al contenedor de la descripcion de los colores
    let colorDescriptions = document.getElementById("color-descriptions-decode");

    // Limpio cualquier descripcion previa
    colorDescriptions.innerHTML = '';

    // Agrego descripciones dinamicamente
    let descriptionData = [
        { color: '#E6E6FA', text: 'Numeración Decimal' },
        { color: '#F0FFF0', text: 'Numeración Binaria' }
    ];

    descriptionData.forEach(item => {
        let description = document.createElement('span');
        description.style.display = 'inline-block';
        description.style.marginRight = '15px';

        // Agrego la caja de color
        let colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '5px';
        colorBox.style.border = '1px solid black';
        colorBox.style.verticalAlign = 'middle';

        // Agrego la descripcion
        let text = document.createElement('span');
        text.innerText = item.text;

        // Adjunto a la descripcion
        description.appendChild(colorBox);
        description.appendChild(text);

        // Adjunto al contenedor
        colorDescriptions.appendChild(description);
    });

    // Agrego explicacion adicional
    let additionalText = document.createElement('span');
    additionalText.style.display = 'inline-block';
    additionalText.style.marginLeft = '15px'; // Separacion de las descripciones
    additionalText.style.fontWeight = 'bold';
    additionalText.innerText = 'P: Bit de Paridad, B: Bit de Cadena'; // Texto explicativo

    colorDescriptions.appendChild(additionalText);

    // Muestro el contenedor de descripciones
    colorDescriptions.style.display = 'block';
}