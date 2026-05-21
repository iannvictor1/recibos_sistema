import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import * as XLSX from "xlsx";

function App() {
  const [formData, setFormData] = useState({
    valor: "",
    pagador: "",
    referente: "",
    emissor: "",
    cidade: "",
    data_pagamento: "",
    forma_pagamento: "dinheiro",

    chave_pix: "",
    banco_pix: "",
    recebedor_pix: "",

    numero_cheque: "",
    agencia_cheque: "",
    banco_cheque: "",

    conta_transferencia: "",
    agencia_transferencia: "",
    banco_transferencia: "",
    favorecido_transferencia: "",

    banco_boleto: "",
    numero_boleto: "",
  });

  const [reciboId, setReciboId] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [ultimoRecibo, setUltimoRecibo] = useState(null);
  const [pagina, setPagina] = useState("gerar");
  const [filtros, setFiltros] = useState({
  pagador: "",
  dataInicio: "",
  dataFim: "",
  formaPagamento: "",
});

  useEffect(() => {
    carregarRecibos();
  }, []);

  async function carregarRecibos() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/recibos/");
      setRecibos(response.data);
    } catch (error) {
      console.error("Erro ao carregar recibos:", error);
    }
  }

  function handleFiltroChange(e) {
  setFiltros({
    ...filtros,
    [e.target.name]: e.target.value,
  });
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/recibos/",
        formData
      );

      alert("Recibo criado com sucesso!");
      setReciboId(response.data.id);
      setUltimoRecibo(response.data);
      carregarRecibos();
    } catch (error) {
      console.error("Erro ao criar recibo:", error);
      alert("Erro ao criar recibo");
    }
}

  function abrirPDF(id) {
    window.open(`http://127.0.0.1:8000/api/recibos/${id}/pdf/`, "_blank");
  }

  function enviarWhatsApp(recibo) {
    const numeroPadrao = "85984281819";

    const telefone = prompt(
      "Confirme ou altere o WhatsApp com DDD:",
      numeroPadrao
    );

    if (!telefone) return;

    const telefoneLimpo = telefone.replace(/\D/g, "");
    const ipServidor = "192.168.1.220";

    const linkPDF = `http://${ipServidor}:8000/api/recibos/${recibo.id}/pdf/`;

    const mensagem = `Olá! Segue o recibo de pagamento.

Pagador: ${recibo.pagador}
Valor: R$ ${recibo.valor}
Data: ${recibo.data_pagamento}

PDF:
${linkPDF}`;

    const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank");
  }

  const recibosFiltrados = recibos.filter((recibo) => {
  const porPagador = recibo.pagador
    .toLowerCase()
    .includes(filtros.pagador.toLowerCase());

  const porForma =
    !filtros.formaPagamento ||
    recibo.forma_pagamento === filtros.formaPagamento;

  const porDataInicio =
    !filtros.dataInicio || recibo.data_pagamento >= filtros.dataInicio;

  const porDataFim =
    !filtros.dataFim || recibo.data_pagamento <= filtros.dataFim;

  return porPagador && porForma && porDataInicio && porDataFim;
});

  function exportarPlanilha() {
    const dados = recibosFiltrados.map((recibo) => ({
      ID: recibo.id,
      Pagador: recibo.pagador,
      Valor: recibo.valor,
      Referente: recibo.referente,
      Emissor: recibo.emissor,
      Cidade: recibo.cidade,
      "Data do pagamento": recibo.data_pagamento,
      "Forma de pagamento": recibo.forma_pagamento,
      "Chave PIX": recibo.chave_pix,
      "Banco PIX": recibo.banco_pix,
      "Recebedor PIX": recibo.recebedor_pix,
      "Número do cheque": recibo.numero_cheque,
      "Agência cheque": recibo.agencia_cheque,
      "Banco cheque": recibo.banco_cheque,
      "Conta transferência": recibo.conta_transferencia,
      "Agência transferência": recibo.agencia_transferencia,
      "Banco transferência": recibo.banco_transferencia,
      "Favorecido transferência": recibo.favorecido_transferencia,
      "Banco boleto": recibo.banco_boleto,
      "Número boleto": recibo.numero_boleto,
    }));

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Recibos");

  XLSX.writeFile(workbook, "historico-recibos.xlsx");
}

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Recibos</h2>

        <button onClick={() => setPagina("gerar")}>Gerar Recibo</button>

        <button onClick={() => setPagina("historico")}>Histórico</button>
      </aside>

      <main className="main">
        {pagina === "gerar" && (
          <div className="container">
            <h1>RECIBO SIMPLES</h1>

            <form onSubmit={handleSubmit} className="formulario">
              <input
                type="number"
                step="0.01"
                name="valor"
                placeholder="Valor"
                value={formData.valor}
                onChange={handleChange}
              />

              <input
                type="text"
                name="pagador"
                placeholder="Pagador"
                value={formData.pagador}
                onChange={handleChange}
              />

              <textarea
                name="referente"
                placeholder="Referente"
                value={formData.referente}
                onChange={handleChange}
              />

              <select
                name="emissor"
                value={formData.emissor}
                onChange={handleChange}
              >
                <option value="">Selecione o emissor</option>

                <option value="C&M DISTRIBUIDORA DE CARNES LTDA-ME">
                  C&M DISTRIBUIDORA DE CARNES LTDA-ME
                </option>

                <option value="OUTRO">Outro</option>
              </select>

              {formData.emissor === "OUTRO" && (
                <input
                  type="text"
                  name="emissor"
                  placeholder="Digite o emissor"
                  onChange={handleChange}
                />
              )}

              <input
                type="text"
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleChange}
              />

              <input
                type="date"
                name="data_pagamento"
                value={formData.data_pagamento}
                onChange={handleChange}
              />

              <select
                name="forma_pagamento"
                value={formData.forma_pagamento}
                onChange={handleChange}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cheque">Cheque</option>
                <option value="transferencia">Transferência</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>

              {formData.forma_pagamento === "pix" && (
                <div className="extra-fields">
                  <input
                    type="text"
                    name="recebedor_pix"
                    placeholder="Quem recebeu?"
                    value={formData.recebedor_pix}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="banco_pix"
                    placeholder="Instituição/Banco"
                    value={formData.banco_pix}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="chave_pix"
                    placeholder="Chave PIX"
                    value={formData.chave_pix}
                    onChange={handleChange}
                  />
                </div>
              )}

              {formData.forma_pagamento === "cheque" && (
                <div className="extra-fields">
                  <input
                    type="text"
                    name="numero_cheque"
                    placeholder="Número do cheque"
                    value={formData.numero_cheque}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="banco_cheque"
                    placeholder="Banco"
                    value={formData.banco_cheque}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="agencia_cheque"
                    placeholder="Agência"
                    value={formData.agencia_cheque}
                    onChange={handleChange}
                  />
                </div>
              )}

              {formData.forma_pagamento === "transferencia" && (
                <div className="extra-fields">
                  <input
                    type="text"
                    name="conta_transferencia"
                    placeholder="Conta"
                    value={formData.conta_transferencia}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="agencia_transferencia"
                    placeholder="Agência"
                    value={formData.agencia_transferencia}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="banco_transferencia"
                    placeholder="Banco"
                    value={formData.banco_transferencia}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="favorecido_transferencia"
                    placeholder="Favorecido"
                    value={formData.favorecido_transferencia}
                    onChange={handleChange}
                  />
                </div>
              )}

              {formData.forma_pagamento === "boleto" && (
                <div className="extra-fields">
                  <input
                    type="text"
                    name="banco_boleto"
                    placeholder="Banco emissor"
                    value={formData.banco_boleto}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="numero_boleto"
                    placeholder="Número do boleto"
                    value={formData.numero_boleto}
                    onChange={handleChange}
                  />
                </div>
              )}

              <button type="submit">Gerar Recibo</button>

              {reciboId && (
                <button type="button" onClick={() => abrirPDF(reciboId)}>
                  Abrir último PDF
                </button>
              )}
            </form>
            {ultimoRecibo && (
              <div className="historico">
                <h2>Último Recibo Gerado</h2>

                <div className="historico-item">
                  <div>
                    <strong>{ultimoRecibo.pagador}</strong>

                    <p>
                      R$ {ultimoRecibo.valor} — {ultimoRecibo.data_pagamento}
                    </p>
                  </div>

                  <div className="acoes">
                    <button
                      type="button"
                      onClick={() => abrirPDF(ultimoRecibo.id)}
                    >
                      Abrir PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => enviarWhatsApp(ultimoRecibo)}
                    >
                      Enviar WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {pagina === "historico" && (
          <div className="container">
            <h1>Histórico de Recibos</h1>

            {recibos.length === 0 && <p>Nenhum recibo cadastrado ainda.</p>}

            <div className="filtros">
              <input
                type="text"
                name="pagador"
                placeholder="Filtrar por pagador"
                value={filtros.pagador}
                onChange={handleFiltroChange}
              />

              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
              />

              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
              />

              <select
                name="formaPagamento"
                value={filtros.formaPagamento}
                onChange={handleFiltroChange}
              >
                <option value="">Todas as formas</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cheque">Cheque</option>
                <option value="transferencia">Transferência</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            <button
              type="button"
              className="botao-exportar"
              onClick={exportarPlanilha}
            >
              Exportar Planilha
            </button>

            {recibosFiltrados.map((recibo) => (
              <div className="historico-item" key={recibo.id}>
                <div>
                  <strong>{recibo.pagador}</strong>
                  <p>
                    R$ {recibo.valor} — {recibo.data_pagamento}
                  </p>
                </div>      

                <div className="acoes">
                  <button type="button" onClick={() => abrirPDF(recibo.id)}>
                    Abrir PDF
                  </button>

                  <button type="button" onClick={() => enviarWhatsApp(recibo)}>
                    Enviar WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;