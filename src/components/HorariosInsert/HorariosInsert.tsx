import { useState, useEffect, useRef, ChangeEvent } from "react";
import githubLogo from "../../images/github.svg";
import CustomTooltip from "../CustomTooltip/CustomTooltip";

interface Registro {
  nome: string;
  data: string;
  entrada: string;
  almocoInicio: string;
  almocoFim: string;
  saida: string;
}

const HorariosInsert = () => {
  const [registros, setRegistros] = useState<Record<string, Registro>>({});
  const [form, setForm] = useState<Registro>({
    nome: "",
    data: new Date().toISOString().slice(0, 10),
    entrada: "",
    almocoInicio: "",
    almocoFim: "",
    saida: "",
  });

  const [mensagem, setMensagem] = useState<string>("");
  const nomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dados = localStorage.getItem("folhaDePonto");
    if (dados) setRegistros(JSON.parse(dados));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarRegistro = () => {
    const { nome, data, entrada, almocoInicio, almocoFim, saida } = form;
    if (!nome || !data || !entrada || !almocoInicio || !almocoFim || !saida) {
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
      almocoInicio: "",
      almocoFim: "",
      saida: "",
    });

    setTimeout(() => {
      nomeRef.current?.focus();
    }, 100);
  };

  const calcularTotal = ({
    entrada,
    almocoInicio,
    almocoFim,
    saida,
  }: Registro) => {
    if (!(entrada && almocoInicio && almocoFim && saida)) {
      return { texto: "-", mensagem: "Preencha todos os campos." };
    }

    const toDate = (hora: string) => new Date(`1970-01-01T${hora}:00`);
    const e = toDate(entrada);
    const a1 = toDate(almocoInicio);
    const a2 = toDate(almocoFim);
    const s = toDate(saida);

    const minutosTotais =
      (s.getTime() - e.getTime() - (a2.getTime() - a1.getTime())) / 1000 / 60;
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
    const funcionarios: Record<string, number> = {};
    const nomesUnicos = new Set<string>();

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
    ) as Record<string, Registro>;

    const linhas = [
      [
        "Data",
        "Funcionário",
        "Entrada",
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
        registro.almocoInicio,
        registro.almocoFim,
        registro.saida,
        total.texto,
      ];
      linhas.push(linha);
    }

    const csvContent = linhas
      .map((l) => l.map((item) => `"${item}"`).join(";"))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "FOLHA DE PONTO.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 animated-gradient">
      <CustomTooltip title="Repositório no GitHub">
        <a
          href="https://github.com/cleslleydemoura"
          target="_blank"
          className="flex flex-col items-center"
        >
          <img
            src={githubLogo}
            alt="Logo do GitHub"
            className="w-16 mb-4 cursor-pointer"
          />
        </a>
      </CustomTooltip>
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl">
        <h1 className="mt-16 text-2xl font-bold text-center mb-6">
          FOLHA DE PONTO
        </h1>

        <div className="flex flex-col gap-4 mb-6">
          {/* Nome */}
          <label className="flex flex-col text-sm font-medium">
            Nome:
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              ref={nomeRef}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Data */}
          <label className="flex flex-col text-sm font-medium">
            Data:
            <input
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Entrada */}
          <label className="flex flex-col text-sm font-medium">
            Entrada:
            <input
              type="time"
              name="entrada"
              value={form.entrada}
              onChange={handleChange}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Almoço Início */}
          <label className="flex flex-col text-sm font-medium">
            Almoço Início:
            <input
              type="time"
              name="almocoInicio"
              value={form.almocoInicio}
              onChange={handleChange}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Almoço Fim */}
          <label className="flex flex-col text-sm font-medium">
            Almoço Fim:
            <input
              type="time"
              name="almocoFim"
              value={form.almocoFim}
              onChange={handleChange}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Saída */}
          <label className="flex flex-col text-sm font-medium">
            Saída:
            <input
              type="time"
              name="saida"
              value={form.saida}
              onChange={handleChange}
              required
              className="mt-1 p-2 border rounded-md text-sm"
            />
          </label>

          {/* Botão de salvar */}
          <button
            onClick={salvarRegistro}
            className="p-3 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700"
          >
            Salvar
          </button>
        </div>

        {mensagem && (
          <div className="bg-gray-100 text-gray-800 text-sm p-3 rounded text-center font-semibold mb-4">
            {mensagem}
          </div>
        )}

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Data</th>
              <th className="border p-2">Funcionário</th>
              <th className="border p-2">Entrada</th>
              <th className="border p-2">Almoço Início</th>
              <th className="border p-2">Almoço Fim</th>
              <th className="border p-2">Saída</th>
              <th className="border p-2">Total Trabalhado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(registros).map(([data, registro]) => {
              const total = calcularTotal(registro);
              return (
                <tr key={data}>
                  <td className="border p-2">{data.split(" - ")[0]}</td>
                  <td className="border p-2">{registro.nome}</td>
                  <td className="border p-2">{registro.entrada}</td>
                  <td className="border p-2">{registro.almocoInicio}</td>
                  <td className="border p-2">{registro.almocoFim}</td>
                  <td className="border p-2">{registro.saida}</td>
                  <td className="border p-2">{total.texto}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          className="mt-4 ml-auto block bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
          onClick={exportarParaCSV}
        >
          Exportar CSV
        </button>

        <div className="mt-6 flex justify-center">
          <div className="bg-gray-100 p-4 rounded-lg text-center w-full max-w-xl">
            <h3 className="text-lg font-bold mb-2">Resumo Semanal</h3>
            <div className="text-sm space-y-1 font-semibold uppercase">
              {getResumoSemanal()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorariosInsert;
