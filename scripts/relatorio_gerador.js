document.addEventListener("DOMContentLoaded", () => {
    const campoSimulacao = document.querySelector(".campo:nth-child(1)");
    const gradeContainer = document.querySelector(".grade");

    const relatorios = JSON.parse(localStorage.getItem("relatorios"));

    if (relatorios && relatorios.length > 0) {
        campoSimulacao.innerHTML = `
            <img src='/images/orbitae_negativo.png' width='240px'>
            <h1>Simulação</h1>
            <h2>Nome: ${relatorios[0].simulacao.nome || "Desconhecido"}</h2>
            <h2>Cor: ${relatorios[0].simulacao.cor || "Não especificado"}</h2>
        `;

        relatorios.forEach(({ corpo, relatorio }) => {
            const corpoDiv = document.createElement("div");
            corpoDiv.classList.add("grade-item");

            corpoDiv.innerHTML = `
                <div style='background-color: black; color: white; padding: 10px; width: 1150px'>
                    <h2>Nome do corpo: ${corpo.nome}</h2>
                    <h2>Massa: ${corpo.massa}</h2>
                    <h2>Densidade: ${corpo.massa/((4 / 3) * 3.14 * (corpo.raio * corpo.raio * corpo.raio))}</h2>
                    <h2>Volume: ${(4 / 3) * 3.14 * (corpo.raio * corpo.raio * corpo.raio)}</h2>
                    <h2>Raio: ${corpo.raio}</h2>
                    <h2>Quantidade de colisões: ${relatorio.quantidadeColisoes}</h2>
                    <h2>Velocidade média X: ${relatorio.velocidadeMediaX}</h2>
                    <h2>Velocidade média Y: ${relatorio.velocidadeMediaY}</h2>
                    <h2>Velocidade média Z: ${relatorio.velocidadeMediaZ}</h2>
                    <h2>Cor: ${corpo.cor}</h2>
                </div>
            `;

            gradeContainer.appendChild(corpoDiv);
        });
    } else {
        gradeContainer.innerHTML = "<p>Nenhum relatório encontrado.</p>";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const gerarPDF = async () => {
        const mainElement = document.querySelector("main");
        const canvas = await html2canvas(mainElement, {
            scale: 3,
            useCORS: true,
        });
    
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF({
            orientation: "landscape",
            unit: "px",
            format: "a4"
        });
    
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = canvas.height * (420 / canvas.width); 
        let heightLeft = imgHeight;
    
        let position = 0;
    
        while (heightLeft > 0) {
            pdf.addImage(imgData, "PNG", 0, position, 510, imgHeight);
            heightLeft -= pageHeight;
    
            if (heightLeft > 0) {
                pdf.addPage();
                position = -heightLeft;
            }
        }
    
        pdf.save("relatorio.pdf");
    };
    

    const botao = document.createElement("button");
    botao.style.backgroundColor = "black";
    botao.style.borderRadius = "20px"
    botao.style.color = "white"
    botao.style.fontSize = "35px"
    botao.style.margin = "20px"
    botao.style.padding = "10px"
    botao.className = "botao"
    botao.textContent = "Gerar PDF";
    botao.addEventListener("click", gerarPDF);
    document.body.appendChild(botao);
});
