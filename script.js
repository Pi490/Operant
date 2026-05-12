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

let checklistGerado = false;

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
"Torno de bancada",
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

/* =====================================================
   UI
===================================================== */

function esconderTudo() {

  if (loginView)
    loginView.classList.add("hidden");

  if (registerView)
    registerView.classList.add("hidden");

  if (techView)
    techView.classList.add("hidden");

  if (adminView)
    adminView.classList.add("hidden");

  if (settingsView)
    settingsView.classList.add("hidden");
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

    await carregarPerfil(user.uid);

  } else {

    window.usuarioLogadoUID = null;

    checklistGerado = false;

    if (window.mainHeader) {
      window.mainHeader.classList.add("hidden");
    }

    window.showLogin();
  }
});

/* =====================================================
   LOGIN
===================================================== */

async function login() {

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

    const perfil =
      document.getElementById("regRole").value;

    if (!email.endsWith("@kuhn.com")) {

      alert(
        "Use um e-mail corporativo @kuhn.com"
      );

      return;
    }

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
        teams: "",
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

  } catch (err) {

    console.error(err);

    alert("Erro ao sair.");
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

  if (!window.dadosUsuarioAtual) return;

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

      if (adminView) {
        adminView.classList.remove("hidden");
      }

      await carregarDashboardAdmin();

      return;
    }

    if (techView) {
      techView.classList.remove("hidden");
    }

    if (!checklistGerado) {

      gerarChecklist();

      checklistGerado = true;
    }

  } catch (err) {

    console.error(err);

    alert("Erro ao carregar perfil.");
  }
};

/* =====================================================
   MENU ADMIN
===================================================== */

function montarMenuPorPerfil(perfil) {

  if (!menuDropdown) return;

  menuDropdown.innerHTML = "";

  if (perfil === "admin") {

    menuDropdown.innerHTML += `
      <button onclick="exportarExcelProblemasPorTecnico()">
        📊 Exportar Excel
      </button>
    `;
  }
}

/* =====================================================
   CHECKLIST
===================================================== */

function atualizarFotos(index) {

  const reposicao =
    document.getElementById(`rep_${index}`)?.checked || false;

  const box =
    document.getElementById(`fotos_${index}`);

  if (!box) return;

  box.classList.toggle("hidden", !reposicao);
}

/* =====================================================
   GERAR CHECKLIST
===================================================== */

function gerarChecklist() {

  const form =
    document.getElementById("checklistForm");

  if (!form) return;

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
      id="rep_${i}" >
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

  if (!file || !img) return;

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

    if (!files[i]) continue;

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

        const f1 =
          document.getElementById(`foto_${i}_1`)?.files[0];

        const f2 =
          document.getElementById(`foto_${i}_2`)?.files[0];

        if (!f1 && !f2) {

          alert(
            `❌ A ferramenta "${ferramentas[i]}" precisa de foto.`
          );

          return;
        }

        fotos =
          await uploadFotosChecklist(
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

  } catch (err) {

    console.error(err);

    alert("Erro ao enviar checklist.");
  }
}

/* =====================================================
   DASHBOARD ADMIN
===================================================== */

async function carregarDashboardAdmin() {

  const tbody =
    document.querySelector(
      "#tabelaTecnicos tbody"
    );

  if (!tbody) return;

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

    if (
      userData.perfil !== "tecnico"
    ) continue;

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

  if (!modal) return;

  modal.classList.remove("hidden");

  document.getElementById("modalEmail").value =
    email;

  document.getElementById("modalTelefone").value =
    telefone;

  document.getElementById("modalTeams").value =
    teams;
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

        if (
          userData.perfil !== "tecnico"
        ) continue;

        const chk =
          await getDoc(
            doc(
              db,
              "checklists",
              `${u.id}_${mesAno}`
            )
          );

        if (!chk.exists()) continue;

        const checklist =
          chk.data().checklist;

        const problemas =
          checklist.filter(r =>
            !r.estaComTecnico ||
            !r.boasCondicoes ||
            r.precisaReposicao
          );

        if (
          problemas.length === 0
        ) continue;

        possuiDados = true;

        const linhas =
          problemas.map(p => ({
            Ferramenta: p.ferramenta,
            "Com Técnico":
              p.estaComTecnico
                ? "Sim"
                : "Não",
            Condição:
              p.boasCondicoes
                ? "Boa"
                : "Ruim",
            Reposição:
              p.precisaReposicao
                ? "Sim"
                : "Não",
            Motivo:
              p.motivo || "",
            "Foto 1":
              p.fotos?.[0] ||
              "Sem foto",
            "Foto 2":
              p.fotos?.[1] ||
              "Sem foto"
          }));

        const ws =
          XLSX.utils.json_to_sheet(
            linhas
          );

        XLSX.utils.book_append_sheet(
          wb,
          ws,
          userData.nome.substring(
            0,
            30
          )
        );
      }

      if (!possuiDados) {

        alert(
          "Nenhum problema encontrado."
        );

        return;
      }

      XLSX.writeFile(
        wb,
        `Relatorio_${mesAno}.xlsx`
      );

    } catch (err) {

      console.error(err);

      alert(
        "Erro ao exportar Excel."
      );
    }
  };
