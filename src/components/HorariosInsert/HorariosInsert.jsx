import { useState, useEffect, useRef } from "react";
import "./HorariosInsert.css";

const HorariosInsert = () => {
  const [registros, setRegistros] = useState({});
  const [form, setForm] = useState({
    nome: "",
    data: new Date().toISOString().slice(0, 10),
    entrada: "",
    viagem: "",
    almocoInicio: "",
    almocoFim: "",
    saida: "",
  });

  const [mensagem, setMensagem] = useState("");
  const nomeRef = useRef(null);

  useEffect(() => {
    const dados = localStorage.getItem("folhaDePonto");
    if (dados) setRegistros(JSON.parse(dados));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarRegistro = () => {
    const { nome, data, entrada, viagem, almocoInicio, almocoFim, saida } =
      form;
    if (
      !nome ||
      !data ||
      !entrada ||
      !viagem ||
      !almocoInicio ||
      !almocoFim ||
      !saida
    ) {
      setMensagem("⛔ Todos os campos são obrigatórios.");
      return;
    }

    const dataBR = form.data.split("-").reverse().join("/");

    const novosRegistros = {
      ...registros,
      [`${dataBR} - ${form.nome}`]: { ...form },
    };

    setRegistros(novosRegistros);
    localStorage.setItem("folhaDePonto", JSON.stringify(novosRegistros));

    const resultado = calcularTotal(form);
    setMensagem(`${form.nome}: ${resultado.mensagem}`);

    setForm({
      nome: "",
      data: new Date().toISOString().slice(0, 10),
      entrada: "",
      viagem: "",
      almocoInicio: "",
      almocoFim: "",
      saida: "",
    });

    setTimeout(() => {
      if (nomeRef.current) nomeRef.current.focus();
    }, 100);
  };

  const calcularTotal = ({ entrada, almocoInicio, almocoFim, saida }) => {
    if (!(entrada && almocoInicio && almocoFim && saida)) {
      return { texto: "-", mensagem: "Preencha todos os campos." };
    }

    const toDate = (hora) => new Date(`1970-01-01T${hora}:00`);
    const e = toDate(entrada);
    const a1 = toDate(almocoInicio);
    const a2 = toDate(almocoFim);
    const s = toDate(saida);

    const minutosTotais = (s - e - (a2 - a1)) / 1000 / 60;
    const horas = Math.floor(minutosTotais / 60);
    const minutos = Math.floor(minutosTotais % 60);

    let mensagemFinal = "";

    if (minutosTotais < 360) {
      mensagemFinal = `⛔ HORAS TOTAIS NÃO CUMPRIDAS (${horas}h ${minutos}min)`;
    } else if (minutosTotais === 360) {
      mensagemFinal = `✅ HORÁRIO CUMPRIDO (${horas}h ${minutos}min)`;
    } else {
      const extra = minutosTotais - 360;
      mensagemFinal = `✅ HORÁRIO CUMPRIDO com ${extra} minutos a mais (${horas}h ${minutos}min)`;
    }

    return { texto: `${horas}h ${minutos}min`, mensagem: mensagemFinal };
  };

  const getResumoSemanal = () => {
    const cargaSemanalMin = 30 * 60;
    const funcionarios = {};
    const nomesUnicos = new Set();

    for (const [dataCompleta, registro] of Object.entries(registros)) {
      const [data, nome] = dataCompleta.split(" - ");
      nomesUnicos.add(nome);
      const [dia, mes, ano] = data.split("/");
      const date = new Date(`${ano}-${mes}-${dia}`);
      const diaDaSemana = date.getDay();

      if (diaDaSemana === 0 || diaDaSemana === 6) continue;

      const total = calcularTotal(registro);
      if (total.texto === "-" || total.mensagem.includes("Preencha")) continue;

      const [h, m] = total.texto.split("h").map((t) => parseInt(t.trim()));
      const minutos = h * 60 + m;

      if (!funcionarios[nome]) funcionarios[nome] = 0;
      funcionarios[nome] += minutos;
    }

    return Array.from(nomesUnicos).map((nome) => {
      const minutosTotais = funcionarios[nome] || 0;
      const h = Math.floor(minutosTotais / 60);
      const m = minutosTotais % 60;

      if (minutosTotais < cargaSemanalMin) {
        return (
          <p key={nome}>
            ⛔ {nome} - Carga semanal incompleta: {h}h {m}min
          </p>
        );
      } else if (minutosTotais === cargaSemanalMin) {
        return (
          <p key={nome}>
            ✅ {nome} - Carga semanal cumprida: {h}h {m}min
          </p>
        );
      } else {
        const extra = minutosTotais - cargaSemanalMin;
        const extraH = Math.floor(extra / 60);
        const extraM = extra % 60;
        return (
          <p key={nome}>
            ✅ {nome} tem {extraH}h {extraM}min a mais.
          </p>
        );
      }
    });
  };

  const exportarParaCSV = () => {
    const registrosSalvos = JSON.parse(
      localStorage.getItem("folhaDePonto") || "{}"
    );

    const linhas = [
      [
        "Data",
        "Funcionário",
        "Entrada",
        "Viagem (min)",
        "Almoço Início",
        "Almoço Fim",
        "Saída",
        "Total Trabalhado",
      ],
    ];

    for (const [chave, registro] of Object.entries(registrosSalvos)) {
      const total = calcularTotal(registro);
      const data = chave.split(" - ")[0];
      const nome = registro.nome;
      const linha = [
        data,
        nome,
        registro.entrada,
        registro.viagem || "0",
        registro.almocoInicio,
        registro.almocoFim,
        registro.saida,
        total.texto,
      ];
      linhas.push(linha);
    }

    const csvContent = linhas.map((l) => l.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "folha_de_ponto.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="background">
      <div className="container">
        <h1>FOLHA DE PONTO</h1>

        <div className="formulario">
          <label>
            Nome:
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              ref={nomeRef}
              required
            />
          </label>
          <label>
            Data:
            <input
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Entrada:
            <input
              type="time"
              name="entrada"
              value={form.entrada}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Tempo de Viagem (minutos):
            <input
              type="number"
              name="viagem"
              value={form.viagem}
              onChange={handleChange}
              placeholder="Ex: 60"
              required
            />
          </label>
          <label>
            Almoço Início:
            <input
              type="time"
              name="almocoInicio"
              value={form.almocoInicio}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Almoço Fim:
            <input
              type="time"
              name="almocoFim"
              value={form.almocoFim}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Saída:
            <input
              type="time"
              name="saida"
              value={form.saida}
              onChange={handleChange}
              required
            />
          </label>

          <button onClick={salvarRegistro}>Salvar</button>
        </div>

        {mensagem && (
          <div className="mensagem">
            <strong>{mensagem}</strong>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Entrada</th>
              <th>Viagem</th>
              <th>Almoço Início</th>
              <th>Almoço Fim</th>
              <th>Saída</th>
              <th>Total Trabalhado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(registros).map(([data, registro]) => {
              const total = calcularTotal(registro);
              return (
                <tr key={data}>
                  <td>{data.split(" - ")[0]}</td>
                  <td>{registro.nome}</td>
                  <td>{registro.entrada}</td>
                  <td>{registro.viagem ? `${registro.viagem} min` : "-"}</td>
                  <td>{registro.almocoInicio}</td>
                  <td>{registro.almocoFim}</td>
                  <td>{registro.saida}</td>
                  <td>{total.texto}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button className="csv-button" onClick={exportarParaCSV} style={{ marginBottom: "1rem" }}>
          Exportar CSV
        </button>
        <div className="mensagem" style={{ marginTop: "2rem" }}>
          <h3>Resumo Semanal</h3>
          {getResumoSemanal()}
        </div>
      </div>
    </div>
  );
};

export default HorariosInsert;
