import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "./firebase.js";

const ferramentas = [
  "Alicate universal",
  "Alicate bomba dágua",
  "Alicate de pressão",
  "Alicate para anel trava int.",
  "Alicate para anel trava ext.",
  "Chave combinada 10mm",
  "Chave combinada 13mm",
  "Chave combinada 17mm",
  "Chave combinada 19mm",
  "Chave de cano 16",
  "Chave Allen 12mm",
  "Trena 05m",
  "Talhadeira 5 x 150",
  "Chave canhão 8mm",
  "Jogo ch. de fenda e philips",
  "Marreta 01 kg",
  "Caixa de ferramenta",
  "Multímetro digital",
  "Alicate de crimpar terminal",
  "Alicate descascador de fio elétrico",
  "Chave Allen 14mm",
  "Chave Allen 16mm",
  "Chave Allen ½''",
  "Chave Allen 9/16''",
  "Chave Allen 5/8''",
  "Jogo soquete métrico estriado",
  "Soquete tipo Allen",
  "Jogo saca pinos paralelos",
  "Jogo chave Torx",
  "Medidor de temperatura a laser",
  "Chave ajustável 24\"",
  "Jogo de chave catraca 8 a 24mm",
  "Ferro de Solda 30W",
  "Escova de aço",
  "Alicate de corte",
  "Alicate de bico",
  "Arco de serra",
  "Paquímetro",
  "Martelo",
  "Martelo Nylon",
  "Chave combinada 32mm",
  "Chave combinada 36mm",
  "Chave combinada 30mm",
  "Chave combinada 24mm",
  "Chave combinada 22mm",
  "Soquete estriado",
  "Chave Grifo",
  "Canhão 6mm",
  "Canhão 8mm",
  "Torno de bancada"
];

let usuarioLogadoUID = null;
let checklistForm = null;
let mesReferencia = null;
let btnEnviarChecklist = null;
let avisoJaRespondeu = null;

const hoje = new Date();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const ano = hoje.getFullYear();
const mesAno = `${ano}-${mes}`;

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnShowRegister = document.getElementById("btnShowRegister");
  const btnShowLogin = document.getElementById("btnShowLogin");

  const loginView = document.getElementById("loginView");
  const registerView = document.getElementById("registerView");
  const techView = document.getElementById("techView");
  const adminView = document.getElementById("adminView");

  // ✅ Inicializar elementos do checklist
  checklistForm = document.getElementById("checklistForm");
  mesReferencia = document.getElementById("mesReferencia");
  btnEnviarChecklist = document.getElementById("btnEnviarChecklist");
  avisoJaRespondeu = document.getElementById("avisoJaRespondeu");

  // ✅ Elementos admin
  const adminMesAno = document.getElementById("adminMesAno");
  const btnExportarExcel = document.getElementById("btnExportarExcel");

  if (adminMesAno) {
    adminMesAno.innerText = mesAno;
  }

  if (!checklistForm || !mesReferencia || !btnEnviarChecklist) {
    console.warn("⚠️ Elementos do checklist não encontrados no HTML");
  }

  // ✅ Detectar login persistente ao carregar a página
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Usuário detectado automaticamente:", user.email);
      usuarioLogadoUID = user.uid;
      carregarPerfil(user.uid);
    } else {
      console.log("❌ Nenhum usuário logado");
      showLogin();
    }
  });

  // Delegação de evento para logout
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnLogout")) {
      logout();
    }
  });

  btnShowRegister.addEventListener("click", showRegister);
  btnShowLogin.addEventListener("click", showLogin);
  btnRegister.addEventListener("click", register);
  btnLogin.addEventListener("click", login);

  if (btnEnviarChecklist) {
    btnEnviarChecklist.addEventListener("click", enviarChecklist);
  }

  if (btnExportarExcel) {
    btnExportarExcel.addEventListener("click", exportarExcelProblemasPorTecnico);
  }

  function esconderTudo() {
    loginView.classList.add("hidden");
    registerView.classList.add("hidden");
    techView.classList.add("hidden");
    adminView.classList.add("hidden");
  }

  function showRegister() {
    esconderTudo();
    registerView.classList.remove("hidden");
  }

  function showLogin() {
    esconderTudo();
    loginView.classList.remove("hidden");
  }

  async function register() {
    const nome = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const senha = document.getElementById("regPassword").value;
    const perfil = document.getElementById("regRole").value;
    const telefone = document.getElementById("regTelefone").value.trim();
    const teams = document.getElementById("regTeams").value.trim();

    if (!nome || !email || !senha) {
      alert("❌ Preencha nome, email e senha!");
      return;
    }

    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = credencial.user.uid;

      await setDoc(doc(db, "users", uid), {
        nome,
        email,
        perfil,
        telefone: telefone || "",
        teams: teams || ""
      });

      alert("✅ Usuário cadastrado!");
      showLogin();
      document.getElementById("regName").value = "";
      document.getElementById("regEmail").value = "";
      document.getElementById("regPassword").value = "";
      document.getElementById("regTelefone").value = "";
      document.getElementById("regTeams").value = "";

    } catch (erro) {
      if (erro.code === "auth/email-already-in-use") {
        alert("❌ Este e-mail já está cadastrado.");
      } else if (erro.code === "auth/weak-password") {
        alert("❌ Senha deve ter pelo menos 6 caracteres.");
      } else {
        alert("❌ Erro: " + erro.message);
      }
    }
  }

  async function login() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const senha = document.getElementById("loginPassword").value;

    if (!email || !senha) {
      alert("❌ Preencha email e senha!");
      return;
    }

    try {
      const credencial = await signInWithEmailAndPassword(auth, email, senha);
      console.log("✅ Login bem-sucedido:", credencial.user.email);
      usuarioLogadoUID = credencial.user.uid;
      await carregarPerfil(credencial.user.uid);

    } catch (erro) {
      console.error("❌ Erro no login:", erro);
      alert("❌ Email ou senha inválidos");
    }
  }

 async function carregarPerfil(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      alert("❌ Perfil não encontrado");
      return;
    }

    const dados = snap.data();
    console.log("✅ Dados do usuário:", dados);
    
    esconderTudo();

    if (dados.perfil === "admin") {
      adminView.classList.remove("hidden");
      
      // ✅ Verifica se a tabela já foi preenchida
      const tbody = document.querySelector("#tabelaTecnicos tbody");
      if (tbody && tbody.innerHTML === "") {
        carregarDashboardAdmin();
      }
    } else {
      techView.classList.remove("hidden");
      await carregarChecklist(uid);
    }

  } catch (erro) {
    console.error("❌ Erro ao carregar perfil:", erro);
    alert("❌ Erro ao carregar perfil");
  }
}

  async function logout() {
    try {
      await signOut(auth);
      console.log("✅ Usuário deslogado");
      usuarioLogadoUID = null;
      showLogin();
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";
    } catch (erro) {
      console.error("❌ Erro ao deslogar:", erro);
    }
  }

  // ===== CHECKLIST COLAPSÁVEL =====

  function getStatusIcon(estaComTecnico, boasCondicoes) {
    if (!estaComTecnico || !boasCondicoes) {
      return "⚠️";
    }
    return "✅";
  }

  function gerarChecklist() {
    if (!checklistForm) {
      console.error("❌ checklistForm não existe");
      return;
    }

    checklistForm.innerHTML = "";

    ferramentas.forEach((ferramenta, index) => {
      const defaultOk = true;

      checklistForm.innerHTML += `
        <details class="ferramenta-item">
          <summary class="ferramenta-header">
            <span class="status-icon" id="status_${index}">✅</span>
            <span class="ferramenta-nome">${ferramenta}</span>
          </summary>

          <div class="ferramenta-detalhes">
            <div class="pergunta-grupo">
              <p>Está com o técnico?</p>
              <label>
                <input type="radio" name="posse_${index}" value="sim" ${defaultOk ? 'checked' : ''}> Sim
              </label>
              <label>
                <input type="radio" name="posse_${index}" value="nao"> Não
              </label>
            </div>

            <div class="pergunta-grupo" id="motivo-grupo_${index}" style="display: ${defaultOk ? 'none' : 'block'}">
              <input
                type="text"
                placeholder="Motivo da ausência"
                id="motivo_${index}"
              >
            </div>

            <div class="pergunta-grupo">
              <p>Está em boas condições?</p>
              <label>
                <input type="radio" name="condicao_${index}" value="sim" ${defaultOk ? 'checked' : ''}> Sim
              </label>
              <label>
                <input type="radio" name="condicao_${index}" value="nao"> Não
              </label>
            </div>

            <div class="pergunta-grupo">
              <label>
                <input type="checkbox" id="reposicao_${index}">
                Precisa de reposição
              </label>
            </div>
          </div>
        </details>
      `;
    });

    ferramentas.forEach((ferramenta, index) => {
      const posseSim = document.querySelector(`input[name="posse_${index}"][value="sim"]`);
      const posseNao = document.querySelector(`input[name="posse_${index}"][value="nao"]`);
      const condicaoSim = document.querySelector(`input[name="condicao_${index}"][value="sim"]`);
      const condicaoNao = document.querySelector(`input[name="condicao_${index}"][value="nao"]`);
      const motivoGrupo = document.getElementById(`motivo-grupo_${index}`);
      const statusIcon = document.getElementById(`status_${index}`);

      function atualizarStatus() {
        const estaComTecnico = document.querySelector(`input[name="posse_${index}"]:checked`)?.value === "sim";
        const boasCondicoes = document.querySelector(`input[name="condicao_${index}"]:checked`)?.value === "sim";
        
        statusIcon.innerText = getStatusIcon(estaComTecnico, boasCondicoes);

        if (!estaComTecnico) {
          motivoGrupo.style.display = "block";
        } else {
          motivoGrupo.style.display = "none";
        }
      }

      posseSim?.addEventListener("change", atualizarStatus);
      posseNao?.addEventListener("change", atualizarStatus);
      condicaoSim?.addEventListener("change", atualizarStatus);
      condicaoNao?.addEventListener("change", atualizarStatus);
    });
  }

  async function carregarChecklist(uid) {
    gerarChecklist();

    if (mesReferencia) {
      mesReferencia.innerText = mesAno;
    }

    try {
      const q = query(
        collection(db, "checklists"),
        where("uid", "==", uid),
        where("mesAno", "==", mesAno)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("✅ Usuário já respondeu este mês");
        if (avisoJaRespondeu) {
          avisoJaRespondeu.classList.remove("hidden");
        }
        preencherChecklistAnterior(querySnapshot.docs[0].data());
      }
    } catch (erro) {
      console.error("❌ Erro ao carregar checklist anterior:", erro);
    }
  }

  function preencherChecklistAnterior(dados) {
    dados.respostas.forEach((resposta, index) => {
      try {
        if (resposta.estaComTecnico) {
          const elem = document.querySelector(`input[name="posse_${index}"][value="sim"]`);
          if (elem) elem.checked = true;
        } else {
          const elem = document.querySelector(`input[name="posse_${index}"][value="nao"]`);
          if (elem) elem.checked = true;
        }

        const motivoElem = document.getElementById(`motivo_${index}`);
        if (motivoElem) {
          motivoElem.value = resposta.motivoAusencia || "";
        }

        if (resposta.boasCondicoes) {
          const elem = document.querySelector(`input[name="condicao_${index}"][value="sim"]`);
          if (elem) elem.checked = true;
        } else {
          const elem = document.querySelector(`input[name="condicao_${index}"][value="nao"]`);
          if (elem) elem.checked = true;
        }

        const reposicaoElem = document.getElementById(`reposicao_${index}`);
        if (reposicaoElem) {
          reposicaoElem.checked = resposta.precisaReposicao || false;
        }

        const statusIcon = document.getElementById(`status_${index}`);
        if (statusIcon) {
          statusIcon.innerText = getStatusIcon(resposta.estaComTecnico, resposta.boasCondicoes);
        }

      } catch (e) {
        console.warn(`⚠️ Erro ao preencher ferramenta ${index}:`, e);
      }
    });
  }

  async function enviarChecklist() {
    if (!usuarioLogadoUID) {
      alert("❌ Erro: Usuário não identificado");
      return;
    }

    const respostas = [];

    ferramentas.forEach((ferramenta, index) => {
      const estaComTecnico =
        document.querySelector(`input[name="posse_${index}"]:checked`)?.value === "sim";

      const boasCondicoes =
        document.querySelector(`input[name="condicao_${index}"]:checked`)?.value === "sim";

      respostas.push({
        ferramenta,
        estaComTecnico,
        motivoAusencia: document.getElementById(`motivo_${index}`)?.value || "",
        boasCondicoes,
        precisaReposicao: document.getElementById(`reposicao_${index}`)?.checked || false
      });
    });

    try {
      const checklistRef = doc(db, "checklists", `${usuarioLogadoUID}_${mesAno}`);
      await setDoc(checklistRef, {
        uid: usuarioLogadoUID,
        mesAno,
        respostas,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      });

      console.log("✅ Checklist salvo com sucesso!");
      alert("✅ Checklist do mês registrado com sucesso!");
    } catch (erro) {
      console.error("❌ Erro ao salvar checklist:", erro);
      alert("❌ Erro ao salvar checklist: " + erro.message);
    }
  }

  // ===== DASHBOARD ADMIN =====

  async function carregarDashboardAdmin() {
    console.log("📊 Carregando dashboard admin...");
    
    const tbody = document.querySelector("#tabelaTecnicos tbody");
    if (!tbody) {
      console.error("❌ Tabela de técnicos não encontrada");
      return;
    }

    tbody.innerHTML = "";

    try {
      const qUsers = query(
        collection(db, "users"),
        where("perfil", "==", "tecnico")
      );

      const usuariosSnapshot = await getDocs(qUsers);

      if (usuariosSnapshot.empty) {
        tbody.innerHTML = "<tr><td colspan='2'>Nenhum técnico cadastrado</td></tr>";
        return;
      }

      for (const userDoc of usuariosSnapshot.docs) {
        const tecnico = userDoc.data();
        const uid = userDoc.id;

        const checklistRef = doc(db, "checklists", `${uid}_${mesAno}`);
        const checklistSnap = await getDoc(checklistRef);

        let status = "❌ Pendente";
        let statusClass = "status-pendente";

        if (checklistSnap.exists()) {
          const respostas = checklistSnap.data().respostas;

          const temProblema = respostas.some(r =>
            !r.estaComTecnico ||
            !r.boasCondicoes ||
            r.precisaReposicao
          );

          status = temProblema ? "⚠️ Respondido com problemas" : "✅ OK";
          statusClass = temProblema ? "status-problemas" : "status-ok";
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="cursor:pointer; color:blue; text-decoration:underline;"
              onclick="window.abrirDetalhesTecnico('${uid}')">
            ${tecnico.nome}
          </td>
          <td class="${statusClass}">${status}</td>
        `;

        tbody.appendChild(tr);
      }

    } catch (erro) {
      console.error("❌ Erro ao carregar dashboard:", erro);
      alert("❌ Erro ao carregar dashboard");
    }
  }

  async function exportarExcelProblemasPorTecnico() {
    console.log("📊 Exportando Excel...");

    const workbook = XLSX.utils.book_new();

    try {
      const qUsers = query(
        collection(db, "users"),
        where("perfil", "==", "tecnico")
      );

      const usuariosSnapshot = await getDocs(qUsers);

      for (const userDoc of usuariosSnapshot.docs) {
        const uid = userDoc.id;
        const tecnico = userDoc.data();

        const qChecklist = query(
          collection(db, "checklists"),
          where("uid", "==", uid),
          where("mesAno", "==", mesAno)
        );

        const checklistSnap = await getDocs(qChecklist);

        const linhas = [];

        checklistSnap.forEach(checklistDoc => {
          const dados = checklistDoc.data();

          dados.respostas.forEach(r => {
            if (
              !r.estaComTecnico ||
              !r.boasCondicoes ||
              r.precisaReposicao
            ) {
              linhas.push({
                Ferramenta: r.ferramenta,
                "Com Técnico": r.estaComTecnico ? "Sim" : "Não",
                "Boas Condições": r.boasCondicoes ? "Sim" : "Não",
                "Precisa Reposição": r.precisaReposicao ? "Sim" : "Não",
                Motivo: r.motivoAusencia || "-",
                "Mês/Ano": dados.mesAno
              });
            }
          });
        });

        if (linhas.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(linhas);
          XLSX.utils.book_append_sheet(workbook, worksheet, tecnico.nome);
        }
      }

      XLSX.writeFile(
        workbook,
        `Relatorio_Ferramentas_${mesAno}.xlsx`
      );

      alert("✅ Excel exportado com sucesso!");

    } catch (erro) {
      console.error("❌ Erro ao exportar Excel:", erro);
      alert("❌ Erro ao exportar: " + erro.message);
    }
  }

  // ✅ Expor funções globalmente
  window.abrirDetalhesTecnico = abrirDetalhesTecnico;
  window.fecharDetalhesTecnico = fecharDetalhesTecnico;

 async function abrirDetalhesTecnico(uid) {
  console.log("👁️ Abrindo detalhes do técnico:", uid);

  const detalhes = document.getElementById("detalhesTecnico");

  if (!detalhes) {
    console.error("❌ Elemento detalhesTecnico não encontrado");
    return;
  }

  const userSnap = await getDoc(doc(db, "users", uid));

  if (!userSnap.exists()) {
    console.warn("⚠️ Técnico não encontrado");
    return;
  }

  const tecnico = userSnap.data();

  document.getElementById("detNome").innerText = tecnico.nome;
  document.getElementById("detEmail").innerText = tecnico.email || "-";
  document.getElementById("detTelefone").innerText = tecnico.telefone || "-";
  document.getElementById("detTeams").innerText = tecnico.teams || "-";

  detalhes.classList.remove("hidden");
}
  function fecharDetalhesTecnico() {
    document.getElementById("detalhesTecnico").classList.add("hidden");
  }
});
