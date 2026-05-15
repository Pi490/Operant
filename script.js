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
  getDocs
} from "./firebase.js";

/* =====================================================
   ESTADO
===================================================== */

window.usuarioLogadoUID = null;
window.dadosUsuarioAtual = null;
window.mesAbertoAtual = null;

let checklistGerado = false;
let dashboardCarregado = false;

const agora = new Date();

const mesAno =
  `${agora.getMonth() + 1}-${agora.getFullYear()}`;

/* =====================================================
   CONFIG
===================================================== */

const perguntasConfig = {
  posse: true,
  condicao: true,
  reposicao: true,
  motivo: true,
  fotos: true
};

const ferramentas = [
  "Alicate de bico",
  "Alicate bomba dágua",
  "Alicate de corte",
  "Alicate de crimpar terminal",
  "Alicate de pressão",
  "Alicate descascador de fio elétrico",
  "Alicate p/ anel trava ext.",
  "Alicate para anel trava ext.",
  "Alicate para anel trava int.",
  "Alicate universal",
  "Arco de serra",
  "Caixa de ferramenta",
  "Canhão 6mm",
  "Canhão 8mm",
  "Chave Allen 12mm",
  "Chave Allen 14mm",
  "Chave Allen 16mm",
  "Chave Allen ½’’",
  "Chave Allen 5/8’’",
  "Chave Allen 9/16’’",
  "Chave ajustável 24” abertura 60mm",
  "Chave canhão 8mm",
  "Chave combinada 10mm",
  "Chave combinada 13mm",
  "Chave combinada 17mm",
  "Chave combinada 19mm",
  "Chave combinada 22mm",
  "Chave combinada 24mm",
  "Chave combinada 30mm",
  "Chave combinada 32mm",
  "Chave combinada 36mm",
  "Chave de cano 16",
  "Chave Grifo",
  "Escova de aço",
  "Ferro de Solda 30W com suporte 9XC EDA",
  "Jogo ch. de fenda e philips",
  "Jogo chave Torx",
  "Jogo de chave catraca 8 a 24mm",
  "Jogo de chave combinada 10 a 50 mm",
  "Jogo saca pinos paralelos",
  "Jogo soquete métrico estriado",
  "Marreta 01 kg",
  "Martelo",
  "Martelo nylon",
  "Medidor de temperatura a laser",
  "Multímetro digital",
  "Paquímetro",
  "Soquete estriado",
  "Soquete tipo Allen",
  "Talhadeira 5 x 150",
  "Trena 05m",
  "Torno de bancada"
];

/* =====================================================
   DOM
===================================================== */

let loginView;
let registerView;
let techView;
let adminView;
let settingsView;

window.mainHeader = null;

let headerPerfil;
let perfilMenu;

let menuToggle;
let menuDropdown;

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  loginView = document.getElementById("loginView");
  registerView = document.getElementById("registerView");
  techView = document.getElementById("techView");
  adminView = document.getElementById("adminView");
  settingsView = document.getElementById("settingsView");

  window.mainHeader =
    document.getElementById("mainHeader");

  headerPerfil =
    document.getElementById("headerPerfil");

  perfilMenu =
    document.getElementById("perfilMenu");

  menuToggle =
    document.getElementById("menuToggle");

  menuDropdown =
    document.getElementById("menuDropdown");

  /* =====================================================
     BOTÕES
  ===================================================== */

  const btnLogin =
    document.getElementById("btnLogin");

  if (btnLogin) {
    btnLogin.onclick = login;
  }

  const btnRegister =
    document.getElementById("btnRegister");

  if (btnRegister) {
    btnRegister.onclick = register;
  }

  const btnShowRegister =
    document.getElementById("btnShowRegister");

  if (btnShowRegister) {
    btnShowRegister.onclick = showRegister;
  }

  const btnShowLogin =
    document.getElementById("btnShowLogin");

  if (btnShowLogin) {
    btnShowLogin.onclick = showLogin;
  }

  const btnEnviarChecklist =
    document.getElementById("btnEnviarChecklist");

  if (btnEnviarChecklist) {
    btnEnviarChecklist.onclick =
      enviarChecklist;
  }

  const btnExportar =
    document.getElementById("btnExportarExcel");

  if (btnExportar) {
    btnExportar.onclick = () => {
      window.exportarExcelProblemasPorTecnico();
    };
  }

  const btnSalvar =
    document.getElementById("btnSalvarDadosTecnico");

  if (btnSalvar) {

    btnSalvar.onclick = async () => {

      try {

        const telefone =
          document.getElementById("meuTelefone").value;

        const teams =
          document.getElementById("meuTeams").value;

        await setDoc(
          doc(db, "users", window.usuarioLogadoUID),
          {
            telefone,
            teams
          },
          {
            merge: true
          }
        );

        alert("✅ Dados atualizados com sucesso!");

      } catch (err) {

        console.error(err);

        alert("Erro ao salvar dados.");
      }
    };
  }

  /* =====================================================
     MENU PERFIL
  ===================================================== */

  if (headerPerfil) {

    headerPerfil.onclick = e => {

      e.stopPropagation();

      if (perfilMenu) {
        perfilMenu.classList.toggle("hidden");
      }

      if (menuDropdown) {
        menuDropdown.classList.add("hidden");
      }
    };
  }

  if (menuToggle) {

    menuToggle.onclick = e => {

      e.stopPropagation();

      if (menuDropdown) {
        menuDropdown.classList.toggle("hidden");
      }

      if (perfilMenu) {
        perfilMenu.classList.add("hidden");
      }
    };
  }

  document.onclick = () => {

    if (perfilMenu) {
      perfilMenu.classList.add("hidden");
    }

    if (menuDropdown) {
      menuDropdown.classList.add("hidden");
    }
  };

  /* =====================================================
     SETTINGS
  ===================================================== */

  window.voltarDoSettings = () => {

    if (settingsView) {
      settingsView.classList.add("hidden");
    }

    window.carregarPerfil(
      window.usuarioLogadoUID
    );
  };
});
// ✅ garante que tudo começa escondido corretamente
esconderTudo();

const homeView = document.getElementById("homeView");
if (homeView) homeView.classList.remove("hidden");

/* =====================================================
   UI
===================================================== */

function esconderTudo() {

  if (loginView) loginView.classList.add("hidden");
  if (registerView) registerView.classList.add("hidden");
  if (techView) techView.classList.add("hidden");
  if (adminView) adminView.classList.add("hidden");
  if (settingsView) settingsView.classList.add("hidden");

  const homeView = document.getElementById("homeView");
  if (homeView) homeView.classList.add("hidden");

  // ✅ ADICIONA ISSO
  const regras = document.getElementById("regrasView");
  if (regras) regras.classList.add("hidden");

  const maletas = document.getElementById("maletasView");
  if (maletas) maletas.classList.add("hidden");

  const regrasTec = document.getElementById("regrasTecnicoView");
  if (regrasTec) regrasTec.classList.add("hidden");
}


window.showLogin = function () {

  esconderTudo();

  if (loginView) {
    loginView.classList.remove("hidden");
  }
};

function showRegister() {

  esconderTudo();

  if (registerView) {
    registerView.classList.remove("hidden");
  }
}

/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(auth, async user => {

  if (user) {

    window.usuarioLogadoUID = user.uid;
    checklistGerado = false;

    if (window.mainHeader) {
      window.mainHeader.classList.remove("hidden");
    }

    const modal =
      document.getElementById("loginModal");

    if (modal)
      modal.classList.add("hidden");

    const loginLink =
      document.getElementById("loginLink");

    if (loginLink)
      loginLink.style.display = "none";

    const perfil =
      document.getElementById("headerPerfil");

    if (perfil)
      perfil.classList.remove("hidden");

    await carregarPerfil(user.uid);

  } else {

    window.usuarioLogadoUID = null;
    checklistGerado = false;

    if (window.mainHeader) {
      window.mainHeader.classList.remove("hidden");
    }

    const loginLink =
      document.getElementById("loginLink");

    if (loginLink)
      loginLink.style.display = "inline";

    const perfil =
      document.getElementById("headerPerfil");

    if (perfil)
      perfil.classList.add("hidden");

    esconderTudo();

    const homeView =
      document.getElementById("homeView");

    if (homeView)
      homeView.classList.remove("hidden");
  }
});

/* =====================================================
   LOGIN
===================================================== */

async function login() {

  const modal = document.getElementById("loginModal");

  // ✅ FECHA NA HORA
  if (modal) modal.classList.add("hidden");

  try {

    const email =
      document.getElementById("loginEmail").value;

    const senha =
      document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );

  } catch (err) {

    console.error(err);

    // ✅ SE DER ERRO, REABRE
    if (modal) modal.classList.remove("hidden");

    alert("Erro ao fazer login.");
  }
}

/* =====================================================
   REGISTER
===================================================== */

async function register() {

  try {

    const nome =
      document.getElementById("regName").value;

    const email =
      document.getElementById("regEmail").value.trim();

    const senha =
      document.getElementById("regPassword").value;

    const confirmarSenha =
      document.getElementById("regConfirmPassword").value;

    const perfil =
      document.getElementById("regRole").value;

    const teams =
      document.getElementById("regTeams").value;

    if (!email.endsWith("@kuhn.com")) {

      alert(
        "Use um e-mail corporativo @kuhn.com"
      );

      return;
    }

    const erro =
      document.getElementById("erroSenha");

    if (senha !== confirmarSenha) {

      if (erro)
        erro.style.display = "block";

      return;
    }

    if (erro)
      erro.style.display = "none";

    const cred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );

    await setDoc(
      doc(db, "users", cred.user.uid),
      {
        nome,
        email,
        telefone: "",
        teams,
        perfil
      }
    );

    alert("✅ Cadastro realizado!");

    window.showLogin();

  } catch (err) {

    console.error(err);

    if (err.code === "auth/email-already-in-use") {

      alert("E-mail já cadastrado.");

    } else if (
      err.code === "auth/weak-password"
    ) {

      alert(
        "A senha deve ter pelo menos 6 caracteres."
      );

    } else {

      alert("Erro ao cadastrar.");
    }
  }
}

/* =====================================================
   LOGOUT
===================================================== */

window.logout = async () => {

  try {
    await signOut(auth);

    esconderTudo();

    const home = document.getElementById("homeView");
    if (home) home.classList.remove("hidden");

  } catch (err) {
    console.error(err);
  }
};

/* =====================================================
   PERFIL
===================================================== */

window.abrirConfiguracoes = () => {

  esconderTudo();

  if (settingsView) {
    settingsView.classList.remove("hidden");
  }

  if (!window.dadosUsuarioAtual)
    return;

  document.getElementById("meuEmail").value =
    window.dadosUsuarioAtual.email || "";

  document.getElementById("meuTelefone").value =
    window.dadosUsuarioAtual.telefone || "";

  document.getElementById("meuTeams").value =
    window.dadosUsuarioAtual.teams || "";
};

window.carregarPerfil = async uid => {

  try {

    const snap =
      await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {

      alert("Usuário não encontrado.");

      return;
    }

    const dados = snap.data();

    window.dadosUsuarioAtual = dados;

    esconderTudo();

    if (headerPerfil) {
      headerPerfil.textContent =
        `${dados.perfil} ▾`;
    }


    
    montarMenuPorPerfil(dados.perfil);
if (dados.perfil === "admin") {

  const regras = document.getElementById("regrasView");

  if (regras) {
    regras.classList.remove("hidden");
  }

  return;
}

    /* =====================================================
       TÉCNICO
    ===================================================== */

   // ✅ SEMPRE mostra dashboard primeiro
if (dados.perfil === "tecnico") {

  // ✅ mostra apenas regras
  const regrasTec = document.getElementById("regrasTecnicoView");
  if (regrasTec) regrasTec.classList.remove("hidden");

  return;
  // ✅ também mostra checklist abaixo
  if (techView) techView.classList.remove("hidden");

  gerarChecklist();
}
  } catch (err) {

    console.error(err);

    alert("Erro ao carregar perfil.");
  }
};

/* =====================================================
   MENU ADMIN
===================================================== */
const menuPorPerfil = {
  admin: [
    { nome: "Análise de técnicos", acao: "abrirAdmin" },
    { nome: "Regras", acao: "abrirRegras" }, 
    { nome: "Aprovar Compras", acao: "abrirAprovarCompras" },
    { nome: "Maletas", acao: "abrirMaletas" },
    { nome: "Estatísticas", acao: "abrirEstatisticas" }
  ],
  tecnico: [
    { nome: "Checklist", acao: "abrirChecklist" },
    { nome: "Documentos Técnicos", acao: "abrirDocumentosTecnicos" },
    { nome: "Certificados", acao: "abrirCertificados" },
  ]
}
function montarMenuPorPerfil(perfil) {

  if (!menuDropdown) return;

  menuDropdown.innerHTML = "";

  const itens = menuPorPerfil[perfil] || [];

  itens.forEach(item => {

    const btn = document.createElement("button");
    btn.textContent = item.nome;

    btn.onclick = () => window[item.acao]();

    menuDropdown.appendChild(btn);
  });
}
window.abrirEstatisticas = () => {
  alert("Área de Estatísticas (em construção)");
};

window.abrirDocumentosTecnicos = () => {
  alert("Documentos técnicos (em construção)");
};

window.abrirCertificados = () => {
  alert("Certificados (em construção)");
};

window.abrirAprovarCompras = () => {
  alert("Aprovação de compras (em construção)");
};

window.abrirComprasFerramentas = () => {
  alert("Compras de ferramentas (em construção)");
};

window.abrirDocumentosPendentes = () => {
  alert("Documentos pendentes (em construção)");
};


/* =====================================================
   CHECKLIST
===================================================== */

function atualizarFotos(index) {

  const reposicao =
    document.getElementById(`rep_${index}`)?.checked || false;

  const box =
    document.getElementById(`fotos_${index}`);

  if (!box)
    return;

  box.classList.toggle("hidden", !reposicao);
}

/* =====================================================
   GERAR CHECKLIST
===================================================== */

function gerarChecklist() {

  const form =
    document.getElementById("checklistForm");

  if (!form)
    return;

  form.innerHTML = "";

  ferramentas.forEach((f, i) => {

    const html = `
      <details class="ferramenta-item">

        <summary class="ferramenta-header">
          ${f}
        </summary>

        <div class="ferramenta-detalhes">

          <div class="pergunta-grupo">

            <p>Está com o técnico?</p>

            <div class="opcoes-horizontal">

              <label>
                <input
                  type="radio"
                  name="posse_${i}"
                  value="sim"
                  checked
                >
                Sim
              </label>

              <label>
                <input
                  type="radio"
                  name="posse_${i}"
                  value="nao"
                >
                Não
              </label>

            </div>

          </div>

          <div class="pergunta-grupo">

            <p>Está em boas condições?</p>

            <div class="opcoes-horizontal">

              <label>
                <input
                  type="radio"
                  name="cond_${i}"
                  value="sim"
                  checked
                >
                Boa
              </label>

              <label>
                <input
                  type="radio"
                  name="cond_${i}"
                  value="nao"
                >
                Ruim
              </label>

            </div>

          </div>

          <div class="pergunta-grupo">

            <p>Precisa de reposição?</p>

            <label class="checkbox-linha">

              <input
                type="checkbox"
                id="rep_${i}"
              >

              Sim

            </label>

          </div>

          <div class="pergunta-grupo">

            <input
              type="text"
              id="mot_${i}"
              placeholder="Motivo"
            >

          </div>

          <div
            class="pergunta-grupo fotos-grupo hidden"
            id="fotos_${i}"
          >

            <p>📸 Adicione fotos</p>

            <input
              type="file"
              id="foto_${i}_1"
              accept="image/*"
            >

            <img
              id="preview_${i}_1"
              class="preview-foto hidden"
            >

            <input
              type="file"
              id="foto_${i}_2"
              accept="image/*"
            >

            <img
              id="preview_${i}_2"
              class="preview-foto hidden"
            >

          </div>

        </div>

      </details>
    `;

    form.insertAdjacentHTML(
      "beforeend",
      html
    );

    const rep =
      document.getElementById(`rep_${i}`);

    const foto1 =
      document.getElementById(`foto_${i}_1`);

    const foto2 =
      document.getElementById(`foto_${i}_2`);

    if (rep) {

      rep.addEventListener(
        "change",
        () => atualizarFotos(i)
      );
    }

    if (foto1) {

      foto1.addEventListener(
        "change",
        () => mostrarPreview(
          foto1,
          `preview_${i}_1`
        )
      );
    }

    if (foto2) {

      foto2.addEventListener(
        "change",
        () => mostrarPreview(
          foto2,
          `preview_${i}_2`
        )
      );
    }
  });
}

/* =====================================================
   PREVIEW
===================================================== */

function mostrarPreview(
  input,
  previewId
) {

  const file =
    input.files[0];

  const img =
    document.getElementById(previewId);

  if (!file || !img)
    return;

  img.src =
    URL.createObjectURL(file);

  img.classList.remove("hidden");
}

/* =====================================================
   UPLOAD
===================================================== */

async function uploadFotosChecklist(
  uid,
  index,
  files
) {

  const urls = [];

  const IMG_API_KEY =
    "1330ec2db0fdff7ca29b67c8c686af05";

  for (let i = 0; i < files.length; i++) {

    if (!files[i])
      continue;

    const formData =
      new FormData();

    formData.append(
      "image",
      files[i]
    );

    try {

      const response =
        await fetch(
          `https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`,
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await response.json();

      if (data.success) {

        urls.push(
          data.data.url
        );

      } else {

        console.error(data);
      }

    } catch (error) {

      console.error(error);
    }
  }

  return urls;
}

/* =====================================================
   ENVIAR CHECKLIST
===================================================== */

async function enviarChecklist() {

  try {

    const checklist = [];

    const ferramentasSemFotoObrigatoria = [];

    let houveProblema = false;

    for (let i = 0; i < ferramentas.length; i++) {

      const estaComTecnico =
        document.querySelector(
          `input[name="posse_${i}"]:checked`
        )?.value === "sim";

      const boasCondicoes =
        document.querySelector(
          `input[name="cond_${i}"]:checked`
        )?.value === "sim";

      const precisaReposicao =
        document.getElementById(`rep_${i}`)?.checked || false;

      const motivo =
        document.getElementById(`mot_${i}`)?.value || "";

      let fotos = [];

      if (precisaReposicao) {

        houveProblema = true;

        const f1 =
          document.getElementById(`foto_${i}_1`)?.files[0];

        const f2 =
          document.getElementById(`foto_${i}_2`)?.files[0];

        const exigeFoto =
          motivoExigeFoto(motivo);

        if (exigeFoto && !f1 && !f2) {

          ferramentasSemFotoObrigatoria.push(
            ferramentas[i]
          );

          continue;
        }

        fotos = await uploadFotosChecklist(
          window.usuarioLogadoUID,
          i,
          [f1, f2]
        );
      }

      checklist.push({
        ferramenta: ferramentas[i],
        estaComTecnico,
        boasCondicoes,
        precisaReposicao,
        motivo,
        fotos
      });
    }

    if (ferramentasSemFotoObrigatoria.length > 0) {

      alert(
        `❌ Ferramentas que precisam de foto:\n\n• ${ferramentasSemFotoObrigatoria.join("\n• ")}`
      );

      return;
    }

    if (!houveProblema) {

      const caixaGrupo =
        document.getElementById("caixaGrupo");

      if (caixaGrupo) {
        caixaGrupo.classList.remove("hidden");
      }

      const fotoCaixa =
        document.getElementById("foto_caixa")?.files[0];

      if (!fotoCaixa) {

        alert(
          "📸 Adicione a foto da caixa organizada antes de enviar."
        );

        return;
      }

      const urls =
        await uploadFotosChecklist(
          window.usuarioLogadoUID,
          "caixa",
          [fotoCaixa]
        );

      checklist.push({
        ferramenta: "Foto da caixa",
        estaComTecnico: true,
        boasCondicoes: true,
        precisaReposicao: false,
        motivo: "Tudo OK",
        fotos: urls
      });
    }

    await salvarChecklist(checklist);

  } catch (err) {

    console.error(err);

    alert("Erro ao enviar checklist.");
  }
}

/* =====================================================
   DASHBOARD ADMIN
===================================================== */

async function carregarDashboardAdmin() {

if (dashboardCarregado) return;
dashboardCarregado = true;

  const tbody =
    document.querySelector(
      "#tabelaTecnicos tbody"
    );

  if (!tbody)
    return;

  tbody.innerHTML = "";

  const users =
    await getDocs(
      collection(db, "users")
    );

  let ok = 0;
  let problemas = 0;
  let pendentes = 0;

  for (const u of users.docs) {

    const userData =
      u.data();

    if (userData.perfil !== "tecnico")
      continue;

    const chk =
      await getDoc(
        doc(
          db,
          "checklists",
          `${u.id}_${mesAno}`
        )
      );

    let status = "Pendente";
    let classe = "pendente";

    if (chk.exists()) {

      const checklist =
        chk.data().checklist;

      const temProblema =
        checklist.some(r =>
          !r.estaComTecnico ||
          !r.boasCondicoes ||
          r.precisaReposicao
        );

      status =
        temProblema
          ? "Problemas"
          : "OK";

      classe =
        temProblema
          ? "problema"
          : "ok";
    }

    if (status === "OK") ok++;
    if (status === "Problemas") problemas++;
    if (status === "Pendente") pendentes++;

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>

        <button
          class="btn-tecnico"
          onclick="abrirDetalhesTecnico(
            '${userData.nome}',
            '${userData.email || ""}',
            '${userData.telefone || ""}',
            '${userData.teams || ""}'
          )"
        >
          ${userData.nome}
        </button>

      </td>

      <td class="${classe}">
        ${status}
      </td>
    `;

    tbody.appendChild(tr);
  }

  const countOk =
    document.getElementById("countOk");

  const countProblemas =
    document.getElementById("countProblemas");

  const countPendente =
    document.getElementById("countPendente");

  if (countOk)
    countOk.textContent = ok;

  if (countProblemas)
    countProblemas.textContent = problemas;

  if (countPendente)
    countPendente.textContent = pendentes;
}

/* =====================================================
   MODAL
===================================================== */

window.abrirDetalhesTecnico = function (
  nome,
  email,
  telefone,
  teams
) {

  const modal =
    document.getElementById("modalTecnico");

  if (!modal)
    return;

  modal.classList.remove("hidden");

  document.getElementById("modalEmail").value =
    email;

  document.getElementById("modalTelefone").value =
    telefone;

  document.getElementById("modalTeams").value =
    teams;

  const link =
    document.getElementById("linkTeams");

  if (link)
    link.href = teams;
};

window.fecharModalTecnico = function () {

  const modal =
    document.getElementById("modalTecnico");

  if (modal) {
    modal.classList.add("hidden");
  }
};

/* =====================================================
   EXCEL
===================================================== */

window.exportarExcelProblemasPorTecnico =
  async function () {

    try {

      const XLSX =
        window.XLSX;

      if (!XLSX) {

        alert(
          "Erro ao carregar biblioteca de Excel."
        );

        return;
      }

      const wb =
        XLSX.utils.book_new();

      const users =
        await getDocs(
          collection(db, "users")
        );

      let possuiDados = false;

      for (const u of users.docs) {

        const userData =
          u.data();

        if (userData.perfil !== "tecnico")
          continue;

        const chk =
          await getDoc(
            doc(
              db,
              "checklists",
              `${u.id}_${mesAno}`
            )
          );

        if (!chk.exists())
          continue;

        const checklist =
          chk.data().checklist || [];

        const problemas =
          checklist.filter(r =>
            !r.estaComTecnico ||
            !r.boasCondicoes ||
            r.precisaReposicao
          );

        if (problemas.length === 0)
          continue;

        possuiDados = true;

        const dados = [
          [
            "Técnico",
            "Ferramenta",
            "Com Técnico",
            "Condição",
            "Reposição",
            "Motivo",
            "Foto 1",
            "Foto 2",
            "Possui Foto",
            "Data"
          ]
        ];

        problemas.forEach((p, index) => {

          const possuiFoto =
            (p.fotos && (p.fotos[0] || p.fotos[1]))
              ? "Sim"
              : "Não";

          dados.push([
            index === 0 ? userData.nome : "",
            p.ferramenta,
            p.estaComTecnico ? "Sim" : "Não",
            p.boasCondicoes ? "Boa" : "Ruim",
            p.precisaReposicao ? "Sim" : "Não",
            p.motivo || "",
            p.fotos?.[0] || "",
            p.fotos?.[1] || "",
            possuiFoto,
            new Date().toLocaleDateString()
          ]);
        });

        const ws =
          XLSX.utils.aoa_to_sheet(dados);

        const range =
          XLSX.utils.decode_range(ws["!ref"]);

        for (let row = 0; row <= range.e.r; row++) {

          for (let col = 0; col <= range.e.c; col++) {

            const cell =
              XLSX.utils.encode_cell({
                r: row,
                c: col
              });

            if (!ws[cell])
              ws[cell] = {};

            ws[cell].s = {

              ...(row === 0 && {

                font: {
                  bold: true,
                  color: { rgb: "FFFFFF" }
                },

                fill: {
                  fgColor: { rgb: "860707" }
                },

                alignment: {
                  horizontal: "center",
                  vertical: "center"
                }
              }),

              border: {
                top: {
                  style: "thin",
                  color: { rgb: "000000" }
                },
                bottom: {
                  style: "thin",
                  color: { rgb: "000000" }
                },
                left: {
                  style: "thin",
                  color: { rgb: "000000" }
                },
                right: {
                  style: "thin",
                  color: { rgb: "000000" }
                }
              }
            };
          }
        }

        for (let i = 1; i < dados.length; i++) {

          const f1 =
            ws[`G${i + 1}`];

          const f2 =
            ws[`H${i + 1}`];

          if (f1 && f1.v) {

            f1.l = {
              Target: f1.v
            };

            f1.v = "Abrir Foto";
          }

          if (f2 && f2.v) {

            f2.l = {
              Target: f2.v
            };

            f2.v = "Abrir Foto";
          }
        }

        ws["!cols"] = [
          { wch: 25 },
          { wch: 35 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 30 },
          { wch: 25 },
          { wch: 25 },
          { wch: 15 },
          { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(
          wb,
          ws,
          userData.nome.substring(0, 30)
        );
      }

      if (!possuiDados) {

        alert("Nenhum problema encontrado.");

        return;
      }

      XLSX.writeFile(
        wb,
        `Relatorio_${mesAno}.xlsx`
      );

    } catch (err) {

      console.error(err);

      alert("Erro ao exportar Excel.");
    }
  };

/* =====================================================
   UTIL
===================================================== */

function motivoExigeFoto(motivo) {

  if (!motivo)
    return false;

  const texto =
    motivo.toLowerCase();

  return (
    texto.includes("quebrou") ||
    texto.includes("enferrujou") ||
    texto.includes("entortou")
  );
}

async function salvarChecklist(checklist) {

  await setDoc(
    doc(
      db,
      "checklists",
      `${window.usuarioLogadoUID}_${mesAno}`
    ),
    {
      uid: window.usuarioLogadoUID,
      checklist,
      criadoEm: new Date(),
      mesAno
    }
  );

  alert("✅ Checklist enviado!");
}

/* =====================================================
   LOGIN MODAL
===================================================== */

window.irParaLogin = function () {

  const loginView =
    document.getElementById("loginView");

  if (!loginView)
    return;

  const techView =
    document.getElementById("techView");

  const adminView =
    document.getElementById("adminView");

  const settingsView =
    document.getElementById("settingsView");

  if (techView)
    techView.classList.add("hidden");

  if (adminView)
    adminView.classList.add("hidden");

  if (settingsView)
    settingsView.classList.add("hidden");

  loginView.classList.remove("hidden");
};

window.abrirLogin = () => {

  if (
    window.usuarioLogadoUID === null &&
    auth.currentUser
  ) {
    return;
  }

  if (window.usuarioLogadoUID) {
    return;
  }

  const modal =
    document.getElementById("loginModal");

  if (modal)
    modal.classList.remove("hidden");
};

window.fecharLogin = () => {

  const modal =
    document.getElementById("loginModal");

  if (modal)
    modal.classList.add("hidden");
};

window.mostrarCadastro = () => {

  document
    .getElementById("loginForm")
    .classList.add("hidden");

  document
    .getElementById("registerForm")
    .classList.remove("hidden");
};

window.mostrarLogin = () => {

  document
    .getElementById("registerForm")
    .classList.add("hidden");

  document
    .getElementById("loginForm")
    .classList.remove("hidden");
};
window.abrirMaletas = async () => {

  esconderTudo();

  const view = document.getElementById("maletasView");

  if (view) {
    view.classList.remove("hidden");
  }

  // ✅ aqui chama sua função
  carregarTecnicosMaletas();
};
async function carregarTecnicosMaletas() {

  const container = document.getElementById("listaTecnicosMaletas");
  container.innerHTML = "";

  const users = await getDocs(collection(db, "users"));

  users.forEach(u => {

    const data = u.data();

    if (data.perfil !== "tecnico") return;

    const btn = document.createElement("button");
    btn.textContent = data.nome;

    btn.onclick = () => {
      carregarMesesMaletas(u.id, data.nome);
    };

    container.appendChild(btn);
  });
}
async function carregarMesesMaletas(uid, nome) {

  window.usuarioSelecionadoUID = uid;

  const container = document.getElementById("listaMesesMaletas");
  container.innerHTML = `<h3>${nome}</h3>`;

  const checklists = await getDocs(collection(db, "checklists"));
const mesesJaAdicionados = new Set();

checklists.forEach(docSnap => {

  if (!docSnap.id.startsWith(uid)) return;

  const mesAno = docSnap.data().mesAno;

  if (mesesJaAdicionados.has(mesAno)) return;
  mesesJaAdicionados.add(mesAno);

  const btn = document.createElement("button");
  btn.textContent = mesAno;

  btn.onclick = async () => {

    if (window.mesAbertoAtual === mesAno) {

      await fecharMes(uid, mesAno);

      const fotos = document.getElementById("fotosMaleta");
      if (fotos) fotos.innerHTML = "";

      window.mesAbertoAtual = null;
      return;
    }

    window.mesAbertoAtual = mesAno;
    window.mesSelecionado = mesAno;

    // ✅ aqui pode usar docSnap
    mostrarFotosMaleta(docSnap.data().checklist);
  };

  container.appendChild(btn);
});
  }

  // ✅ abriu outro mês
  window.mesAbertoAtual = mesAno;

  window.mesSelecionado = mesAno;

function mostrarFotosMaleta(checklist) {

  const container = document.getElementById("fotosMaleta");
  container.innerHTML = "";

  const caixa = checklist.find(
    item => item.ferramenta === "Foto da caixa"
  );

  if (!caixa || !caixa.fotos[0]) {
    container.innerHTML = "<p>Sem foto da maleta</p>";
    return;
  }

  const img = document.createElement("img");
  img.src = caixa.fotos[0];
  img.style.maxWidth = "300px";
  img.style.borderRadius = "8px";
  img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  
  container.appendChild(img);
}
window.abrirChecklist = () => {

  esconderTudo();

  if (techView) techView.classList.remove("hidden");

  gerarChecklist();
};

window.abrirAdmin = () => {

  esconderTudo();

  if (adminView) adminView.classList.remove("hidden");

  carregarDashboardAdmin();
};
async function fecharMes(uid, mesAno) {

  try {

    await setDoc(
      doc(db, "checklists", `${uid}_${mesAno}`),
      {
        fechado: true
      },
      { merge: true }
    );

  } catch (err) {
    console.error(err);
    alert("Erro ao fechar mês.");
  }
}
window.abrirRegras = () => {

  esconderTudo();

  const view = document.getElementById("regrasView");
  if (view) view.classList.remove("hidden");
};
