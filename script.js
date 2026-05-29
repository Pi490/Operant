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

window.usuarioLogadoUID = null;
window.dadosUsuarioAtual = null;
window.mesAbertoAtual = null;
window.usuarioSelecionadoUID = null;
window.mesSelecionado = null;

let checklistGerado = false;
let dashboardCarregado = false;

const agora = new Date();

const mesAno = `${agora.getMonth() + 1}-${agora.getFullYear()}`;

const locaisRetirada = [
  "Kuhn do Brasil, Passo Fundo, Rs",
  "Kuhn montana do Brasil, São josé dos Pinhais, PR",
  "Unidade de Distribuição 1, Palmas, TO",
  "Unidade de Distribuição 2, Rondonópolis, MT",
];

const ferramentas = {

  "Alicates": [
    "Alicate de bico",
    "Alicate bomba dágua",
    "Alicate de corte",
    "Alicate de crimpar terminal",
    "Alicate de pressão",
    "Alicate descascador de fio elétrico",
    "Alicate p/ anel trava ext.",
    "Alicate para anel trava ext.",
    "Alicate para anel trava int.",
    "Alicate universal"
  ],

  "Chaves": [
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
    "Jogo ch. de fenda e philips",
    "Jogo chave Torx",
    "Jogo de chave catraca 8 a 24mm",
    "Jogo de chave combinada 10 a 50 mm"
  ],

  "Medição": [
    "Medidor de temperatura a laser",
    "Multímetro digital",
    "Paquímetro",
    "Trena 05m"
  ],

  "Eletrônico": [
    "Ferro de Solda 30W com suporte 9XC EDA"
  ],

  "Outros": [
    "Arco de serra",
    "Caixa de ferramenta",
    "Canhão 6mm",
    "Canhão 8mm",
    "Escova de aço",
    "Jogo saca pinos paralelos",
    "Jogo soquete métrico estriado",
    "Marreta 01 kg",
    "Martelo",
    "Martelo nylon",
    "Soquete estriado",
    "Soquete tipo Allen",
    "Talhadeira 5 x 150",
    "Torno de bancada"
  ]
};

const ferramentasFlat = Object.values(ferramentas).flat();

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

function esconderTudo() {
  if (loginView) loginView.classList.add("hidden");
  if (registerView) registerView.classList.add("hidden");
  if (techView) techView.classList.add("hidden");
  if (adminView) adminView.classList.add("hidden");
  if (settingsView) settingsView.classList.add("hidden");

  const homeView = document.getElementById("homeView");
  if (homeView) homeView.classList.add("hidden");

  const regras = document.getElementById("regrasView");
  if (regras) regras.classList.add("hidden");

  const maletas = document.getElementById("maletasView");
  if (maletas) maletas.classList.add("hidden");

  const regrasTec = document.getElementById("regrasTecnicoView");
  if (regrasTec) regrasTec.classList.add("hidden");

  const compras = document.getElementById("comprasView");
  if (compras) compras.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {

  loginView = document.getElementById("loginView");
  registerView = document.getElementById("registerView");
  techView = document.getElementById("techView");
  adminView = document.getElementById("adminView");
  settingsView = document.getElementById("settingsView");

  window.mainHeader = document.getElementById("mainHeader");

  headerPerfil = document.getElementById("headerPerfil");
  perfilMenu = document.getElementById("perfilMenu");
  menuToggle = document.getElementById("menuToggle");
  menuDropdown = document.getElementById("menuDropdown");

  esconderTudo();

  const homeView = document.getElementById("homeView");
  if (homeView) homeView.classList.remove("hidden");

  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) btnLogin.onclick = login;

  const btnRegister = document.getElementById("btnRegister");
  if (btnRegister) btnRegister.onclick = register;

  const btnEnviarChecklist = document.getElementById("btnEnviarChecklist");
  if (btnEnviarChecklist) {
    btnEnviarChecklist.onclick = enviarChecklist;
  }

  const btnExportar = document.getElementById("btnExportarExcel");

  if (btnExportar) {
    btnExportar.onclick = () => {
      window.exportarExcelProblemasPorTecnico();
    };
  }
const fotoCaixa = document.getElementById("foto_caixa");

if (fotoCaixa) {
  fotoCaixa.addEventListener("change", () => {
    mostrarPreview(fotoCaixa, "preview_caixa");
  });
}

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
    if (perfilMenu) perfilMenu.classList.add("hidden");
    if (menuDropdown) menuDropdown.classList.add("hidden");
  };
  carregarGestores();
  toggleGestor();
});

window.showLogin = function () {
  esconderTudo();

  if (loginView) {
    loginView.classList.remove("hidden");
  }
};

async function login() {

  const modal = document.getElementById("loginModal");

  if (modal) modal.classList.add("hidden");

  try {

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, senha);

  } catch (err) {

    console.error(err);

    if (modal) modal.classList.remove("hidden");

    alert("Erro ao fazer login.");
  }
}

async function register() {

  try {

    const nome = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value.trim();
    const telefone = document.getElementById("regTelefone").value;
    const teams = document.getElementById("regTeams").value;
    const senha = document.getElementById("regPassword").value;
    const confirmarSenha = document.getElementById("regConfirmPassword").value;
    const perfil = document.getElementById("regRole").value;

    if (!email.endsWith("@kuhn.com")) {
      alert("Use um e-mail corporativo @kuhn.com");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    let gestorUid = null;

    if (perfil === "tecnico") {
      gestorUid = document.getElementById("regGestor").value;
    }

    await setDoc(doc(db, "users", cred.user.uid), {
      nome,
      email,
      telefone,
      teams,
      perfil,
      gestorUid
    });

    alert("✅ Cadastro realizado!");
    window.mostrarLogin();

  } catch (err) {
    console.error(err);
    alert("Erro ao cadastrar: " + err.message);
  }
}

onAuthStateChanged(auth, async user => {

  if (user) {

    window.usuarioLogadoUID = user.uid;

    // ✅ ESCONDE LOGIN
    const loginLink = document.getElementById("loginLink");
    if (loginLink) loginLink.style.display = "none";

    // ✅ MOSTRA PERFIL
    const perfil = document.getElementById("headerPerfil");
    if (perfil) perfil.classList.remove("hidden");

 esconderTudo();
    const homeView = document.getElementById("homeView");
    if (homeView) homeView.classList.remove("hidden");
    carregarPerfil(user.uid);

  } else {

    window.usuarioLogadoUID = null;

    // ✅ MOSTRA LOGIN
    const loginLink = document.getElementById("loginLink");
    if (loginLink) loginLink.style.display = "inline";

    // ✅ ESCONDE PERFIL
    const perfil = document.getElementById("headerPerfil");
    if (perfil) perfil.classList.add("hidden");

  }
});

window.carregarPerfil = async uid => {

  try {

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      alert("Usuário não encontrado.");
      return;
    }

    const dados = snap.data();

    window.dadosUsuarioAtual = dados;

    esconderTudo();

    if (headerPerfil) {
      headerPerfil.textContent = `${dados.perfil} ▾`;
      headerPerfil.classList.remove("hidden");
    }

    montarMenuPorPerfil(dados.perfil);

    if (dados.perfil === "admin") {

      const regras = document.getElementById("regrasView");

      if (regras) regras.classList.remove("hidden");

      return;
    }

    if (dados.perfil === "tecnico") {

  const regrasTec = document.getElementById("regrasTecnicoView");

  if (regrasTec) {
    regrasTec.classList.remove("hidden");
  }

  // ✅ NÃO MOSTRA CHECKLIST AQUI
  return;
}

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar perfil.");
  }
};

const menuPorPerfil = {
  admin: [
    { nome: "Análise de técnicos", acao: "abrirAdmin" },
    { nome: "Regras", acao: "abrirRegras" },
    { nome: "Maletas", acao: "abrirMaletas" },
    { nome: "Estatísticas", acao: "abrirEstatisticas" },
    {nome: "Documentação", acao: "abrirDocumentacao"}, 
    {nome: "Aprovar Compras", acao: "abrirAprovarCompras"}
  ],

  tecnico: [
    { nome: "Checklist", acao: "abrirChecklist" },
    { nome: "Regras", acao: "abrirRegras" },
    {nome: "Documentação", acao: "abrirDocumentacao"}, 
   {nome: "Compras", acao: "abrirCompras"}
  ]
};

function montarMenuPorPerfil(perfil) {

  if (!menuDropdown) return;

  menuDropdown.innerHTML = "";

  const itens = menuPorPerfil[perfil] || [];

  itens.forEach(item => {

    const btn = document.createElement("button");

    btn.textContent = item.nome;

    btn.onclick = () => {
  if (typeof window[item.acao] === "function") {
    window[item.acao]();
  } else {
    console.warn("Função não existe:", item.acao);
  }
};

    menuDropdown.appendChild(btn);
  });
}

function atualizarFotos(index) {

  const reposicao = document.getElementById(`rep_${index}`)?.checked || false;

  const box = document.getElementById(`fotos_${index}`);

  if (!box) return;

  box.classList.toggle("hidden", !reposicao);
}

function gerarChecklist() {

  const form = document.getElementById("checklistForm");
  if (!form) return;

  form.innerHTML = "";

  let indexGlobal = 0;

  Object.entries(ferramentas).forEach(([grupo, lista]) => {

    const grupoHTML = `
      <details class="grupo-bloco">
        <summary class="grupo-titulo">${grupo}</summary>
        <div id="grupo_${grupo}"></div>
      </details>
    `;

    form.insertAdjacentHTML("beforeend", grupoHTML);

    const container = document.getElementById(`grupo_${grupo}`);

    lista.forEach((f) => {

      const i = indexGlobal++;

      const html = `
        <details class="ferramenta-item">

          <summary class="ferramenta-header">
            ${f}
          </summary>

          <div class="ferramenta-detalhes">

            <div class="pergunta-grupo">
              <p>Está com o técnico?</p>
              <div class="opcoes-horizontal">
            <label><input type="radio" name="posse_${i}" value="sim" checked> Sim</label>
            <label><input type="radio" name="posse_${i}" value="nao"> Não</label>
          </div>
            </div>

            <div class="pergunta-grupo">
              <p>Está em boas condições?</p>
              <div class="opcoes-horizontal">
              <label><input type="radio" name="cond_${i}" value="sim" checked> Boa</label>
              <label><input type="radio" name="cond_${i}" value="nao"> Ruim</label>
            </div>

            <div class="pergunta-grupo">
              <p>Precisa de reposição?</p>

              <label class="checkbox-linha">
                <input type="checkbox" id="rep_${i}">
                Sim
              </label>
            </div>

            <div class="pergunta-grupo">
              <input type="text" id="mot_${i}" placeholder="Motivo">
            </div>

            <div class="pergunta-grupo fotos-grupo hidden" id="fotos_${i}">
              <p>📸 Adicione fotos</p>

              <input type="file" id="foto_${i}_1" accept="image/*">
              <img id="preview_${i}_1" class="preview-foto hidden">

              <input type="file" id="foto_${i}_2" accept="image/*">
              <img id="preview_${i}_2" class="preview-foto hidden">
            </div>

          </div>
        </details>
      `;

      container.insertAdjacentHTML("beforeend", html);

      // ✅ mantém comportamento de fotos
      const rep = document.getElementById(`rep_${i}`);
      if (rep) {
        rep.addEventListener("change", () => atualizarFotos(i));
      }

      const f1 = document.getElementById(`foto_${i}_1`);
      const f2 = document.getElementById(`foto_${i}_2`);

      if (f1) {
        f1.addEventListener("change", () => {
          mostrarPreview(f1, `preview_${i}_1`);
        });
      }

      if (f2) {
        f2.addEventListener("change", () => {
          mostrarPreview(f2, `preview_${i}_2`);
        });
      }

    });

  });
}

function mostrarPreview(input, previewId) {

  const file = input.files[0];

  const img = document.getElementById(previewId);

  if (!file || !img) return;

  img.src = URL.createObjectURL(file);

  img.classList.remove("hidden");
}

function motivoExigeFoto(motivo) {

  if (!motivo) return false;

  const texto = motivo.toLowerCase();

  return (
    texto.includes("quebrou") ||
    texto.includes("enferrujou") ||
    texto.includes("entortou")
  );
}

async function uploadFotosChecklist(uid, index, files) {

  const urls = [];

  const IMG_API_KEY = "1330ec2db0fdff7ca29b67c8c686af05";

  for (let i = 0; i < files.length; i++) {

    if (!files[i]) continue;

    const formData = new FormData();

    formData.append("image", files[i]);

    try {

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        urls.push(data.data.url);
      }

    } catch (error) {
      console.error(error);
    }
  }

  return urls;
}

async function salvarChecklist(checklist) {

  await setDoc(
    doc(db, "checklists", `${window.usuarioLogadoUID}_${mesAno}`),
    {
      uid: window.usuarioLogadoUID,
      checklist,
      criadoEm: new Date(),
      mesAno
    }
  );

  alert("✅ Checklist enviado!");
}

async function enviarChecklist() {

  try {

    const checklist = [];

    const ferramentasSemFoto = [];
    let houveProblema = false;

   for (let i = 0; i < ferramentasFlat.length; i++) {

  const estaComTecnico =
    document.querySelector(`input[name="posse_${i}"]:checked`)?.value === "sim";

  const boasCondicoes =
    document.querySelector(`input[name="cond_${i}"]:checked`)?.value === "sim";

  const precisaReposicao =
    document.getElementById(`rep_${i}`)?.checked || false;

  const motivo =
    document.getElementById(`mot_${i}`)?.value || "";

  let fotos = [];

  // ✅ AQUI está a correção do seu bug
  if (
    !estaComTecnico ||
    !boasCondicoes ||
    precisaReposicao
  ) {
    houveProblema = true;
  }

  if (precisaReposicao) {

    const f1 = document.getElementById(`foto_${i}_1`)?.files[0];
    const f2 = document.getElementById(`foto_${i}_2`)?.files[0];

    const exigeFoto = motivoExigeFoto(motivo);

    if (exigeFoto && !f1 && !f2) {
      ferramentasSemFoto.push(ferramentasFlat[i]);
      continue;
    }

    fotos = await uploadFotosChecklist(
      window.usuarioLogadoUID,
      i,
      [f1, f2]
    );
}

checklist.push({
    ferramenta: ferramentasFlat[i],
    estaComTecnico,
    boasCondicoes,
    precisaReposicao,
    motivo,
    fotos
  });
   }

    // ✅ BLOQUEIA ENVIO SE FALTA FOTO
    if (ferramentasSemFoto.length > 0) {

      alert(
        "❌ As seguintes ferramentas exigem foto:\n\n• " +
        ferramentasSemFoto.join("\n• ")
      );

      return;
    }

    // ✅ SE NÃO HOUVE PROBLEMA → OBRIGA FOTO DA MALETA
    if (!houveProblema) {

      const fotoCaixa =
        document.getElementById("foto_caixa")?.files[0];
if (!houveProblema) {

  const caixaGrupo = document.getElementById("caixaGrupo");

  if (caixaGrupo) {
    caixaGrupo.classList.remove("hidden");
  }

}
      if (!fotoCaixa) {

        alert("📸 Adicione a foto da maleta organizada!");

        return;
      }
      const urls = await uploadFotosChecklist(
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
window.abrirChecklist = () => {

  esconderTudo();

  if (techView) {
    techView.classList.remove("hidden");
  }

  gerarChecklist();
};

window.abrirAdmin = () => {

  esconderTudo();

  dashboardCarregado = false;

  const adminView = document.getElementById("adminView");
  adminView.classList.remove("hidden");

  // 🔥 remove tabela de compras
  document.querySelectorAll("#adminView table").forEach(t => {
    if (t.id !== "tabelaTecnicos") t.remove();
  });

  // 🔥 mostra tabela original
  document.getElementById("tabelaTecnicos").style.display = "table";

  // 🔥 mostra contador
  const contador = document.querySelector("#adminView p");
  if (contador) contador.style.display = "block";

  // 🔥 mostra botão excel
  const btnExcel = document.getElementById("btnExportarExcel");
  if (btnExcel) btnExcel.style.display = "inline-block";

  carregarDashboardAdmin();
};
async function carregarDashboardAdmin() {

  let ok = 0;
  let problemas = 0;
  let pendentes = 0;

  const tbody = document.querySelector("#tabelaTecnicos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const users = await getDocs(collection(db, "users"));

  for (const u of users.docs) {

    const userData = u.data();
    if (userData.perfil !== "tecnico") continue;

    let status = "Pendente";
    let classe = "pendente";

    const chk = await getDoc(
      doc(db, "checklists", `${u.id}_${mesAno}`)
    );

    if (chk.exists()) {

      const checklist = chk.data().checklist || [];

      const temProblema = checklist.some(r =>
        !r.estaComTecnico ||
        !r.boasCondicoes ||
        r.precisaReposicao
      );

      status = temProblema ? "Problemas" : "OK";
      classe = temProblema ? "problema" : "ok";
    }

    if (status === "OK") ok++;
    else if (status === "Problemas") problemas++;
    else pendentes++;

    const tr = document.createElement("tr");

   tr.innerHTML = `
  <td 
    style="cursor:pointer; color:blue; text-decoration:underline"
    onclick="abrirDetalhesTecnico(
      '${userData.nome}',
      '${userData.email}',
      '${userData.telefone || ""}',
      '${userData.teams || ""}'
    )"
  >
    ${userData.nome}
  </td>

  <td class="${classe}">${status}</td>
`;

    tbody.appendChild(tr);
  }

  document.getElementById("countOk").textContent = ok;
  document.getElementById("countProblemas").textContent = problemas;
  document.getElementById("countPendente").textContent = pendentes;
}

async function carregarTecnicosMaletas() {

  const container = document.getElementById("listaTecnicosMaletas");
  if (!container) return;

  container.innerHTML = "";

  const table = document.createElement("table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>Técnico</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  container.appendChild(table);

  const tbody = table.querySelector("tbody");

  const users = await getDocs(collection(db, "users"));

  users.forEach(u => {

    const data = u.data();
    if (data.perfil !== "tecnico") return;

    const tr = document.createElement("tr");

    tr.innerHTML = `<td>${data.nome}</td>`;

    tr.onclick = () => {

      if (window.usuarioSelecionadoUID === u.id) {

        document.getElementById("listaMesesMaletas").innerHTML = "";
        document.getElementById("fotosMaleta").innerHTML = "";

        window.usuarioSelecionadoUID = null;
        return;
      }

      window.usuarioSelecionadoUID = u.id;
      carregarMesesMaletas(u.id, data.nome);
    };

    tbody.appendChild(tr);
  });
}

window.exportarExcelProblemasPorTecnico = async function () {

  try {

    const XLSX = window.XLSX;
    if (!XLSX) {
      alert("Erro ao carregar biblioteca Excel");
      return;
    }

    const wb = XLSX.utils.book_new();

    const users = await getDocs(collection(db, "users"));

    for (const u of users.docs) {

      const userData = u.data();
      if (userData.perfil !== "tecnico") continue;

      const chk = await getDoc(
        doc(db, "checklists", `${u.id}_${mesAno}`)
      );

      let dados = [
        ["Técnico", "Ferramenta", "Condição", "Reposição", "Motivo", "Foto 1", "Foto 2"]
      ];

      let corLinha = [];

     if (!chk.exists()) {

  dados.push([userData.nome, "Checklist não enviado", "", "", ""]);


  // ✅ marcar essa linha como crítica
  corLinha.push("pendente");
      
      }else {

        const checklist = chk.data().checklist || [];

        const problemas = checklist.filter(r =>
          !r.estaComTecnico ||
          !r.boasCondicoes ||
          r.precisaReposicao
        );

        // ✅ SE TEM PROBLEMA
        if (problemas.length > 0) {

          problemas.forEach((p, index) => {

            dados.push([
              index === 0 ? userData.nome : "",
              p.ferramenta,
              p.boasCondicoes ? "Boa" : "Ruim",
              p.precisaReposicao ? "Sim" : "Não",
              p.motivo || "",
              p.fotos?.[0] || "",
              p.fotos?.[1] || ""
            ]);


            corLinha.push(p.boasCondicoes ? null : "problema");
          });

        } else {

          // ✅ TUDO OK
          dados.push([
            userData.nome,
            "Status: Tudo OK",
            "",
            "",
            "Seguimento: Imagem da maleta anexada em 'Maletas'"
          ]);
        }
      }

      const ws = XLSX.utils.aoa_to_sheet(dados);

      const range = XLSX.utils.decode_range(ws["!ref"]);

      for (let row = 0; row <= range.e.r; row++) {

  for (let col = 0; col <= range.e.c; col++) {

    const cell = XLSX.utils.encode_cell({ r: row, c: col });

    if (!ws[cell]) ws[cell] = {};

    let estilo = {
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // ✅ cabeçalho
    if (row === 0) {
      estilo.font = { bold: true, color: { rgb: "FFFFFF" } };
      estilo.fill = { fgColor: { rgb: "860707" } };
    }

    estilo.alignment = {
      wrapText: true
    };

    if (corLinha[row - 1] === "problema") {
      estilo.font = { bold: true, color: { rgb: "C00000" } };
    }

    if (corLinha[row - 1] === "pendente") {
      estilo.font = { bold: true, color: { rgb: "C00000" } };
    }

    if (dados[row][1]?.includes("Tudo OK")) {
      estilo.font = { bold: true, color: { rgb: "006100" } };
    }

    ws[cell].s = estilo;
  }
}
        for (let i = 1; i < dados.length; i++) {

          const f1 = ws[`F${i + 1}`];
          const f2 = ws[`G${i + 1}`];

         if (f1 && f1.v) {
            f1.l = {
              Target: f1.v,
              Tooltip: "Abrir imagem"
            };
            f1.v = "🔗 Abrir Foto";
          }

          if (f2 && f2.v) {
            f2.l = {
              Target: f2.v,
              Tooltip: "Abrir imagem"
            };
            f2.v = "🔗 Abrir Foto";
          }

              }

      // ✅ TAMANHO DAS COLUNAS
     ws["!cols"] = [
        { wch: 25 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 50 },
        { wch: 20 },
        { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        userData.nome.substring(0, 30)
      );
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

window.logout = async () => {

  try {

    await signOut(auth);

    window.dadosUsuarioAtual = null;
    window.mesAbertoAtual = null;

    esconderTudo();

    const home = document.getElementById("homeView");

    if (home) {
      home.classList.remove("hidden");
    }

  } catch (err) {
    console.error(err);
  }
};

window.abrirMaletas = async () => {

  esconderTudo();

  const view = document.getElementById("maletasView");

  if (view) {
    view.classList.remove("hidden");
  }

  carregarTecnicosMaletas();
};

async function carregarMesesMaletas(uid, nome) {

  window.usuarioSelecionadoUID = uid;

  const container = document.getElementById("listaMesesMaletas");

  if (!container) return;

  container.innerHTML = `<h3>${nome}</h3>`;

  const checklists = await getDocs(collection(db, "checklists"));

  const mesesJaAdicionados = new Set();

  checklists.forEach(docSnap => {

    if (!docSnap.id.startsWith(uid)) return;
    const dados = docSnap.data();
    const mesAno = dados.mesAno;
    if (!mesAno) return;
    if (mesesJaAdicionados.has(mesAno)) return;
    mesesJaAdicionados.add(mesAno);

    const btn = document.createElement("span");
    btn.className = "mes-item";
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

      mostrarFotosMaleta(dados.checklist || []);
    };

    container.appendChild(btn);
  });
}

function mostrarFotosMaleta(checklist) {

  const container = document.getElementById("fotosMaleta");

  if (!container) return;

  container.innerHTML = "";

  const caixa = checklist.find(item => item.ferramenta === "Foto da caixa");

  if (!caixa || !caixa.fotos || !caixa.fotos[0]) {
    container.innerHTML = "<p>Sem foto da maleta</p>";
    return;
  }

  const img = document.createElement("img");

  img.src = caixa.fotos[0];

  img.style.maxWidth = "300px";

  container.appendChild(img);
}

async function fecharMes(uid, mesAno) {

  try {

    await setDoc(
      doc(db, "checklists", `${uid}_${mesAno}`),
      {
        fechado: true
      },
      {
        merge: true
      }
    );

  } catch (err) {
    console.error(err);
  }
}

window.abrirRegras = () => {

  esconderTudo();

  const view = document.getElementById("regrasView");

  if (view) {
    view.classList.remove("hidden");
  }
};

window.mostrarCadastro = () => {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
};

window.mostrarLogin = () => {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
};

window.abrirLogin = () => {

  if (window.usuarioLogadoUID) return;

  const modal = document.getElementById("loginModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
};

window.fecharLogin = () => {

  const modal = document.getElementById("loginModal");

  if (modal) {
    modal.classList.add("hidden");
  }
};
document.getElementById("loading")?.classList.remove("hidden");

window.abrirDetalhesTecnico = function (
  nome,
  email,
  telefone,
  teams,
) {

  const modal = document.getElementById("modalTecnico");
  if (!modal) return;

  modal.classList.remove("hidden");

  document.getElementById("modalEmail").value = email;
  document.getElementById("modalTelefone").value = telefone;
  document.getElementById("modalTeams").value = teams;

  const link = document.getElementById("linkTeams");
  if (link) link.href = teams;
};


window.fecharModalTecnico = function () {

  const modal = document.getElementById("modalTecnico");

  if (modal) {
    modal.classList.add("hidden");
  }
};
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
        { telefone, teams },
        { merge: true }
      );

      alert("✅ Dados atualizados!");

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
    }
  };
}
window.voltarDoSettings = () => {

  if (settingsView) {
    settingsView.classList.add("hidden");
  }

  // ✅ volta pro fluxo normal
  if (window.usuarioLogadoUID) {
    carregarPerfil(window.usuarioLogadoUID);
  }
};

async function carregarGestores() {

  const select = document.getElementById("regGestor");
  if (!select) return;

  const users = await getDocs(collection(db, "users"));

  users.forEach(u => {
    const data = u.data();

    if (data.perfil === "admin") { // ou gestor

      const option = document.createElement("option");
      option.value = u.id;
      option.textContent = data.nome;

      select.appendChild(option);
    }
  });
}
window.abrirCompras = () => {

  esconderTudo();

  const view = document.getElementById("comprasView");
  view.classList.remove("hidden");

  view.innerHTML = `
    <h3>Solicitar Compra</h3>

    <select id="compFerramenta">
      ${ferramentasFlat.map(f => `<option>${f}</option>`).join("")}
    </select>

    <input id="compMotivo" placeholder="Motivo (quebrou, perdeu...)" />

    <button onclick="enviarCompra()">Solicitar</button>
  `;
};

window.enviarCompra = async () => {

  const ferramenta = document.getElementById("compFerramenta").value;
  const motivo = document.getElementById("compMotivo").value;

  const userSnap = await getDoc(doc(db, "users", window.usuarioLogadoUID));
  const userData = userSnap.data();

await setDoc(
  doc(collection(db, "compras")),
  {
    tecnicoUid: window.usuarioLogadoUID,
    tecnicoNome: userData.nome,
    gestorUid: userData.gestorUid,
    ferramenta,
    motivo,
    status: "pendente",
    tipo: "manual", // ✅ AQUI
    prazo: null,
    localRetirada: null,
    criadoEm: new Date()
  }
);

  alert("✅ Solicitação enviada!");
};
window.abrirAprovarCompras = async () => {

  esconderTudo();

  const container = document.getElementById("adminView");
  container.classList.remove("hidden");

  // ✅ PEGA contador corretamente
  const contador = document.querySelector("#adminView p");
  if (contador) contador.style.display = "none";

  const btnExcel = document.getElementById("btnExportarExcel");
  if (btnExcel) btnExcel.style.display = "none";

  const tabela = document.getElementById("tabelaTecnicos");
  if (tabela) tabela.style.display = "none";

  // 🔥 remove tabelas antigas de compras
  container.querySelectorAll("table").forEach(t => {
    if (t.id !== "tabelaTecnicos") t.remove();
  });

  const table = document.createElement("table");

  table.innerHTML = `
    <thead>
      <th>Técnico</th>
      <th>Ferramenta</th>
      <th>Motivo</th>
      <th>Status</th>
      <th>Ações</th>
    </thead>
    <tbody id="tbodyCompras"></tbody>
  `;

  const wrapper = document.createElement("div");
wrapper.className = "tabela-wrapper";

wrapper.appendChild(table);
container.appendChild(wrapper);

  const tbody = document.getElementById("tbodyCompras");

  const compras = await getDocs(collection(db, "compras"));

  compras.forEach(docSnap => {

    const data = docSnap.data();

    if (data.gestorUid !== window.usuarioLogadoUID) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.tecnicoNome}</td>
      <td>${data.ferramenta}</td>
      <td>${data.motivo}</td>
      <td>${data.status}</td>
      <td>
        ${data.status === "pendente" ? `
          <button onclick="abrirAprovacaoComPrazo('${docSnap.id}')">✅</button>
          <button onclick="colocarEmEspera('${docSnap.id}')">⏳</button>
          <button onclick="reprovarCompra('${docSnap.id}')">❌</button>
        ` : ""}

      </td>
    `;

    tbody.appendChild(tr);
  });
};

window.aprovarCompra = async (id) => {

  const snap = await getDoc(doc(db, "compras", id));
  const data = snap.data();

  if (data.tipo !== "manual") return;

  const prazo = document.getElementById(`prazo_${id}`).value;
  const local = document.getElementById(`local_${id}`).value;

  await setDoc(
    doc(db, "compras", id),
    {
      status: "aprovado",
      prazo,
      localRetirada: local
    },
    { merge: true }
  );

  alert("✅ Compra aprovada!");
};

window.reprovarCompra = async (id) => {

  await setDoc(
    doc(db, "compras", id),
    {
      status: "reprovado"
    },
    { merge: true }
  );

  alert("❌ Compra reprovada!");
      abrirAprovarCompras();
};

window.confirmarAprovacao = async (id) => {

  const local = document.getElementById(`local_${id}`).value;

  await setDoc(
    doc(db, "compras", id),
    {
      status: "aprovado",
      localRetirada: local
    },
    { merge: true }
  );

  alert("✅ Aprovado com local definido");

  abrirAprovarCompras(); // atualiza tela
};

window.retirar = async (id) => {

  await setDoc(
    doc(db, "compras", id),
    {
      status: "retirado"
    },
    { merge: true }
  );

  alert("📦 Retirada confirmada!");


const compras = await getDocs(collection(db, "compras"));

let pendentes = 0;
let aprovadas = 0;
let reprovadas = 0;

compras.forEach(doc => {
  const s = doc.data().status;

  if (s === "pendente") pendentes++;
  if (s === "aprovado") aprovadas++;
  if (s === "reprovado") reprovadas++;
});
};
window.confirmarAprovacao = async (id) => {

  const local = document.getElementById(`local_${id}`).value;

  await setDoc(
    doc(db, "compras", id),
    {
      status: "aprovado",
      localRetirada: local
    },
    { merge: true }
  );

  // ✅ FECHA O MODAL
  const modal = document.getElementById("modalAprovacao");
  if (modal) modal.remove();

  alert("✅ Aprovado com local definido");

  abrirAprovarCompras(); // atualiza tabela
};

window.abrirSelecaoLocal = (id) => {

  const modal = document.createElement("div");
  modal.id = "modalAprovacao";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Selecionar local de retirada</h3>

      <select id="local_${id}">
        ${locaisRetirada.map(l => `<option>${l}</option>`).join("")}
      </select>

      <button onclick="confirmarAprovacao('${id}')">✅ Confirmar</button>
    </div>
  `;

  document.body.appendChild(modal);
};

window.toggleGestor = () => {

  const perfil = document.getElementById("regRole")?.value;
  const selectGestor = document.getElementById("regGestor");

  if (!selectGestor) return;

  const label = selectGestor.previousElementSibling;

  if (perfil === "admin") {
    selectGestor.style.display = "none";
    if (label) label.style.display = "none";
  } else {
    selectGestor.style.display = "block";
    if (label) label.style.display = "block";
  }
};

window.colocarEmEspera = async (id) => {

  await setDoc(
    doc(db, "compras", id),
    {
      status: "em_espera"
    },
    { merge: true }
  );

  alert("⏳ Compra em espera");
  abrirAprovarCompras();
};
window.abrirAprovacaoComPrazo = (id) => {

  const modal = document.createElement("div");
  modal.id = "modalAprovacao";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Aprovar compra</h3>

      <label>Prazo:</label>
      <input type="date" id="prazo_${id}" />

      <label>Local de retirada:</label>
      <select id="local_${id}">
        ${locaisRetirada.map(l => `<option>${l}</option>`).join("")}
      </select>

      <button onclick="confirmarAprovacaoComPrazo('${id}')">✅ Confirmar</button>
    </div>
  `;

  document.body.appendChild(modal);
};
window.confirmarAprovacaoComPrazo = async (id) => {

  const prazo = document.getElementById(`prazo_${id}`).value;
  const local = document.getElementById(`local_${id}`).value;

  if (!prazo) {
    alert("Defina um prazo!");
    return;
  }

  await setDoc(
    doc(db, "compras", id),
    {
      status: "aprovado",
      prazo,
      localRetirada: local
    },
    { merge: true }
  );

  document.getElementById("modalAprovacao")?.remove();

  alert("✅ Compra aprovada com prazo");

  abrirAprovarCompras();
};

window.abrirEstatisticas = async () => {

  esconderTudo();

  const view = document.getElementById("estatisticasView");
  view.classList.remove("hidden");

  await carregarEstatisticas();
};
async function carregarEstatisticas() {
 console.log("estatisticas carregando...");
  const users = await getDocs(collection(db, "users"));
  const checklists = await getDocs(collection(db, "checklists"));
  const compras = await getDocs(collection(db, "compras"));

  // 🔹 1. GRÁFICO POR TÉCNICO
  const dadosTecnicos = {};

  users.forEach(u => {
    const data = u.data();
    if (data.perfil === "tecnico") {
      dadosTecnicos[data.nome] = 0;
    }
  });

  checklists.forEach(c => {
    const data = c.data();
   const userSnap = users.docs.find(u => u.id === data.uid);
    const nome = userSnap?.data()?.nome;

    if (nome && dadosTecnicos[nome] !== undefined) {
      dadosTecnicos[nome]++;
    }
  });

  gerarGraficoBarra("graficoTecnicos", Object.keys(dadosTecnicos), Object.values(dadosTecnicos), "Checklists por Técnico");

  // 🔹 2. FERRAMENTAS COM PROBLEMA
  const problemasFerramentas = {};

  checklists.forEach(c => {
    const lista = c.data().checklist || [];

    lista.forEach(item => {

      if (!item.boasCondicoes || item.precisaReposicao) {
        problemasFerramentas[item.ferramenta] = (problemasFerramentas[item.ferramenta] || 0) + 1;
      }

    });
  });

  gerarGraficoBarra("graficoFerramentasProblema",
    Object.keys(problemasFerramentas),
    Object.values(problemasFerramentas),
    "Ferramentas com mais problemas");

  // 🔹 3. COMPRAS MAIS PEDIDAS
  const comprasFerramentas = {};

  compras.forEach(c => {
    const data = c.data();
    comprasFerramentas[data.ferramenta] = (comprasFerramentas[data.ferramenta] || 0) + 1;
  });

  gerarGraficoBarra("graficoCompras",
    Object.keys(comprasFerramentas),
    Object.values(comprasFerramentas),
    "Ferramentas mais solicitadas");

  // 🔹 4. TEMPO DE CHECKLIST (simples)
  const atraso = [];

  checklists.forEach(c => {
    const data = c.data();

    const criado = new Date(data.criadoEm.toDate?.() || data.criadoEm);

    atraso.push(criado.getDate());
  });

  gerarGraficoBarra("graficoChecklistTempo",
    atraso.map((_, i) => "Checklist " + i),
    atraso,
    "Dia do envio do checklist");
}
function gerarGraficoBarra(id, labels, dados, titulo) {

  const ctx = document.getElementById(id).getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: titulo,
        data: dados
      }]
    },
    options: {
      responsive: true
    }
  });
}

window.abrirDocumentacao = () => {
  alert("Área de documentação em construção");
};
