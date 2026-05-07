/* ============================================
   DILUÍ – Camada de Storage
   Abstração isolada para auth, histórico e favoritos.

   IMPORTANTE: Esta camada é INTENCIONALMENTE simples.
   Quando migrar para backend real, basta substituir
   este arquivo mantendo a mesma API pública.

   ⚠️ AVISO DE SEGURANÇA:
   Senhas no localStorage NÃO são seguras de verdade.
   Isto é apenas um sistema de "perfis locais" para MVP.
   Em produção, use Supabase, Firebase ou backend custom.
   ============================================ */

const STORAGE_KEYS = {
    USERS: 'dilui_users',
    SESSION: 'dilui_session',
    HISTORICO_PREFIX: 'dilui_historico_',
    FAVORITOS_PREFIX: 'dilui_favoritos_',
    PREFERENCIAS_PREFIX: 'dilui_preferencias_',
    PREFERENCIAS_CONVIDADO: 'dilui_preferencias_convidado'
};

const MAX_HISTORICO = 20;

// ============================================
// HELPERS internos
// ============================================

function _ler(chave, padrao = null) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : padrao;
    } catch (e) {
        console.warn(`Erro ao ler ${chave}:`, e);
        return padrao;
    }
}

function _gravar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (e) {
        console.warn(`Erro ao gravar ${chave}:`, e);
        return false;
    }
}

// ⚠️ NÃO É HASH SEGURO — apenas obfuscação básica para MVP local
function _hashSimples(texto) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
        const char = texto.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}

function _gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================
// AUTENTICAÇÃO
// ============================================

const Auth = {
    cadastrar(nome, email, senha) {
        const emailNormalizado = email.trim().toLowerCase();

        if (!nome.trim() || !emailNormalizado || !senha) {
            return { sucesso: false, erro: 'Preencha todos os campos.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            return { sucesso: false, erro: 'E-mail inválido.' };
        }
        if (senha.length < 4) {
            return { sucesso: false, erro: 'Senha deve ter ao menos 4 caracteres.' };
        }

        const usuarios = _ler(STORAGE_KEYS.USERS, {});
        if (usuarios[emailNormalizado]) {
            return { sucesso: false, erro: 'Este e-mail já está cadastrado.' };
        }

        const novoUsuario = {
            id: _gerarId(),
            nome: nome.trim(),
            email: emailNormalizado,
            senhaHash: _hashSimples(senha),
            criadoEm: new Date().toISOString()
        };

        usuarios[emailNormalizado] = novoUsuario;
        _gravar(STORAGE_KEYS.USERS, usuarios);

        return this.login(emailNormalizado, senha);
    },

    login(email, senha) {
        const emailNormalizado = email.trim().toLowerCase();
        const usuarios = _ler(STORAGE_KEYS.USERS, {});
        const usuario = usuarios[emailNormalizado];

        if (!usuario) {
            return { sucesso: false, erro: 'E-mail não cadastrado.' };
        }
        if (usuario.senhaHash !== _hashSimples(senha)) {
            return { sucesso: false, erro: 'Senha incorreta.' };
        }

        const sessao = {
            usuarioId: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            iniciadaEm: new Date().toISOString()
        };
        _gravar(STORAGE_KEYS.SESSION, sessao);

        const { senhaHash, ...usuarioSemSenha } = usuario;
        return { sucesso: true, usuario: usuarioSemSenha };
    },

    logout() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    usuarioAtual() {
        return _ler(STORAGE_KEYS.SESSION);
    },

    estaLogado() {
        return this.usuarioAtual() !== null;
    }
};

// ============================================
// HISTÓRICO DE MISTURAS
// ============================================

const Historico = {
    _chave() {
        const usuario = Auth.usuarioAtual();
        if (!usuario) return null;
        return STORAGE_KEYS.HISTORICO_PREFIX + usuario.usuarioId;
    },

    adicionar(mistura) {
        const chave = this._chave();
        if (!chave) return false;

        const lista = _ler(chave, []);
        const item = {
            id: _gerarId(),
            criadoEm: new Date().toISOString(),
            ...mistura
        };

        lista.unshift(item);

        if (lista.length > MAX_HISTORICO) {
            lista.length = MAX_HISTORICO;
        }

        return _gravar(chave, lista);
    },

    listar() {
        const chave = this._chave();
        if (!chave) return [];
        return _ler(chave, []);
    },

    remover(id) {
        const chave = this._chave();
        if (!chave) return false;

        const lista = _ler(chave, []);
        const filtrada = lista.filter(item => item.id !== id);
        return _gravar(chave, filtrada);
    },

    limpar() {
        const chave = this._chave();
        if (!chave) return false;
        return _gravar(chave, []);
    }
};

// ============================================
// FAVORITOS DE PRODUTOS
// ============================================

const Favoritos = {
    _chave() {
        const usuario = Auth.usuarioAtual();
        if (!usuario) return null;
        return STORAGE_KEYS.FAVORITOS_PREFIX + usuario.usuarioId;
    },

    listar() {
        const chave = this._chave();
        if (!chave) return [];
        return _ler(chave, []);
    },

    contem(produtoId) {
        return this.listar().includes(produtoId);
    },

    adicionar(produtoId) {
        const chave = this._chave();
        if (!chave) return false;

        const lista = _ler(chave, []);
        if (!lista.includes(produtoId)) {
            lista.push(produtoId);
            return _gravar(chave, lista);
        }
        return true;
    },

    remover(produtoId) {
        const chave = this._chave();
        if (!chave) return false;

        const lista = _ler(chave, []);
        const filtrada = lista.filter(id => id !== produtoId);
        return _gravar(chave, filtrada);
    },

    alternar(produtoId) {
        if (this.contem(produtoId)) {
            this.remover(produtoId);
            return false;
        } else {
            this.adicionar(produtoId);
            return true;
        }
    }
};

// ============================================
// PREFERÊNCIAS DO USUÁRIO
// ============================================
//
// Funciona para convidado (chave fixa) e logado (chave por usuário).
// Defaults seguros: bloquear em perigo, contador zerado, versão zero.

const Preferencias = {
    _chave() {
        const usuario = Auth.usuarioAtual();
        if (usuario) return STORAGE_KEYS.PREFERENCIAS_PREFIX + usuario.usuarioId;
        return STORAGE_KEYS.PREFERENCIAS_CONVIDADO;
    },

    _padrao() {
        return {
            alertasPerigo: 'bloquear',
            vezesCienteContador: 0,
            versaoAlertasReconhecida: 0
        };
    },

    obter() {
        return { ...this._padrao(), ..._ler(this._chave(), {}) };
    },

    atualizar(parcial) {
        const novo = { ...this.obter(), ...parcial };
        _gravar(this._chave(), novo);
        return novo;
    }
};

// ============================================
// EXPOSIÇÃO PÚBLICA
// ============================================

window.DiluiStorage = {
    Auth,
    Historico,
    Favoritos,
    Preferencias
};
