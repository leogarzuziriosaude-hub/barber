"use client";

import { ChangeEvent, useEffect, useState } from "react";
import NextImage from "next/image";
import {
  PerfilBarbearia,
  normalizarWhatsapp,
  perfilInicial,
} from "@/lib/barber-storage";
import { criarClienteSupabase } from "@/lib/supabase/client";
import { buscarConfiguracao, perfilDoBanco } from "@/lib/supabase/configuracoes";

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase() || "PH";
}

function reduzirFoto(arquivo: File) {
  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onerror = () => reject(new Error("A imagem selecionada é inválida."));
      imagem.onload = () => {
        const tamanho = Math.min(imagem.width, imagem.height);
        const origemX = (imagem.width - tamanho) / 2;
        const origemY = (imagem.height - tamanho) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 480;
        const contexto = canvas.getContext("2d");
        if (!contexto) return reject(new Error("Não foi possível preparar a imagem."));
        contexto.drawImage(imagem, origemX, origemY, tamanho, tamanho, 0, 0, 480, 480);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      imagem.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  });
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilBarbearia>(perfilInicial);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const supabase = criarClienteSupabase();
        const configuracao = await buscarConfiguracao(supabase);
        if (ativo) setPerfil(perfilDoBanco(configuracao));
      } catch {
        if (ativo) setErro("Não foi possível carregar o perfil do banco de dados.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  async function persistirPerfil(dados: PerfilBarbearia, supabase = criarClienteSupabase()) {
    let fotoUrl: string | null = dados.foto || null;

    if (dados.foto.startsWith("data:")) {
      const arquivo = await (await fetch(dados.foto)).blob();
      const { error: erroFoto } = await supabase.storage
        .from("perfil")
        .upload("barbearia/foto.jpg", arquivo, { contentType: "image/jpeg", upsert: true });
      if (erroFoto) throw erroFoto;
      const { data } = supabase.storage.from("perfil").getPublicUrl("barbearia/foto.jpg");
      fotoUrl = `${data.publicUrl}?v=${Date.now()}`;
    } else if (!dados.foto) {
      await supabase.storage.from("perfil").remove(["barbearia/foto.jpg"]);
    }

    const atualizado = { ...dados, foto: fotoUrl ?? "" };
    const { error } = await supabase
      .from("configuracoes")
      .update({
        nome: atualizado.nome,
        subtitulo: atualizado.subtitulo,
        responsavel: atualizado.responsavel,
        whatsapp: atualizado.whatsapp,
        endereco: atualizado.endereco,
        foto_url: fotoUrl,
      })
      .eq("id", 1);

    if (error) throw error;
    return atualizado;
  }

  function atualizar(campo: keyof PerfilBarbearia, valor: string) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
    setSalvo(false);
  }

  async function escolherFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErro("Escolha um arquivo de imagem.");
      return;
    }
    try {
      setProcessandoFoto(true);
      setErro("");
      atualizar("foto", await reduzirFoto(arquivo));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível carregar a foto.");
    } finally {
      setProcessandoFoto(false);
    }
  }

  async function salvar() {
    if (!perfil.nome.trim() || !perfil.responsavel.trim() || !perfil.whatsapp.trim()) {
      setErro("Preencha o nome da barbearia, o responsável e o WhatsApp.");
      return;
    }
    const atualizado = {
      ...perfil,
      nome: perfil.nome.trim(),
      subtitulo: perfil.subtitulo.trim(),
      responsavel: perfil.responsavel.trim(),
      endereco: perfil.endereco.trim(),
      whatsapp: normalizarWhatsapp(perfil.whatsapp),
    };
    try {
      setSalvando(true);
      const persistido = await persistirPerfil(atualizado);
      setPerfil(persistido);
      window.dispatchEvent(new Event("ph10:perfil-atualizado"));
      setErro("");
      setSalvo(true);
    } catch {
      setErro("Não foi possível salvar o perfil. Confira sua conexão e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="app-page">
      <div className="page-wrap">
        <div className="mx-auto w-full max-w-3xl">
          <header className="hero-panel">
            <p className="eyebrow">PH10 • Identidade</p>
            <h1 className="display-font page-title mt-2">Perfil</h1>
          </header>

          <section className="panel mt-5 p-5 lg:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#d8c29e]/40 bg-[#24211e] text-3xl font-black text-[#d8c29e]">
              {perfil.foto ? <NextImage src={perfil.foto} alt={`Foto de ${perfil.nome}`} width={112} height={112} unoptimized className="h-full w-full object-cover" /> : iniciais(perfil.nome)}
            </div>
            <div>
              <h2 className="text-xl font-black">Foto da barbearia</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-2xl bg-[#e7d7b8] px-4 py-3 text-xs font-black text-[#24211e]">
                  {processandoFoto ? "Preparando..." : perfil.foto ? "Trocar foto" : "Escolher foto"}
                  <input type="file" accept="image/*" disabled={processandoFoto} onChange={escolherFoto} className="sr-only" />
                </label>
                {perfil.foto && <button type="button" onClick={() => atualizar("foto", "")} className="rounded-2xl bg-white/5 px-4 py-3 text-xs font-black">Remover</button>}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="text-xs font-bold text-[#c8bfb4]">Nome da barbearia</span><input value={perfil.nome} onChange={(event) => atualizar("nome", event.target.value)} placeholder="Barbearia PH10" className="mt-2 w-full rounded-2xl border border-[#eee2c9]/15 bg-[#191715] px-4 py-4 shadow-inner outline-none placeholder:text-[#70685f] focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30" /></label>
            <label className="block"><span className="text-xs font-bold text-[#c8bfb4]">Descrição curta</span><input value={perfil.subtitulo} onChange={(event) => atualizar("subtitulo", event.target.value)} placeholder="Estúdio masculino" className="mt-2 w-full rounded-2xl border border-[#eee2c9]/15 bg-[#191715] px-4 py-4 shadow-inner outline-none placeholder:text-[#70685f] focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30" /></label>
            <label className="block"><span className="text-xs font-bold text-[#c8bfb4]">Responsável</span><input value={perfil.responsavel} onChange={(event) => atualizar("responsavel", event.target.value)} placeholder="Pedro Henrique" className="mt-2 w-full rounded-2xl border border-[#eee2c9]/15 bg-[#191715] px-4 py-4 shadow-inner outline-none placeholder:text-[#70685f] focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30" /></label>
            <label className="block"><span className="text-xs font-bold text-[#c8bfb4]">WhatsApp com DDD</span><input value={perfil.whatsapp} onChange={(event) => atualizar("whatsapp", event.target.value.replace(/\D/g, "").slice(0, 13))} inputMode="numeric" placeholder="5521999999999" className="mt-2 w-full rounded-2xl border border-[#eee2c9]/15 bg-[#191715] px-4 py-4 shadow-inner outline-none placeholder:text-[#70685f] focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30" /></label>
            <label className="block md:col-span-2"><span className="text-xs font-bold text-[#c8bfb4]">Endereço</span><input value={perfil.endereco} onChange={(event) => atualizar("endereco", event.target.value)} placeholder="Rua, número, bairro e cidade" autoComplete="street-address" className="mt-2 w-full rounded-2xl border border-[#eee2c9]/15 bg-[#191715] px-4 py-4 shadow-inner outline-none placeholder:text-[#70685f] focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30" /></label>
          </div>

            <button type="button" onClick={salvar} disabled={carregando || salvando || processandoFoto} className="mt-6 w-full rounded-2xl bg-[#e7d7b8] px-5 py-4 text-sm font-black text-[#24211e] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{carregando ? "Carregando..." : salvando ? "Salvando..." : "Salvar perfil"}</button>
          </section>
        </div>
      </div>

      {erro && <div onClick={() => setErro("")} className="safe-modal-shell fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm"><div onClick={(event) => event.stopPropagation()} className="safe-modal-card w-full max-w-sm rounded-[2rem] border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-400/10 text-2xl font-black text-amber-400">!</div><h2 className="mt-4 text-2xl font-black">Confira os dados</h2><p className="mt-2 text-sm leading-relaxed text-neutral-400">{erro}</p><button type="button" onClick={() => setErro("")} className="mt-6 w-full rounded-2xl bg-amber-400 px-4 py-4 text-sm font-black text-neutral-950">Entendi</button></div></div>}
      {salvo && <div onClick={() => setSalvo(false)} className="safe-modal-shell fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm"><div onClick={(event) => event.stopPropagation()} className="safe-modal-card w-full max-w-sm rounded-[2rem] border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg></div><h2 className="mt-4 text-2xl font-black">Perfil salvo</h2><p className="mt-2 text-sm leading-relaxed text-neutral-400">As informações já foram atualizadas na página do cliente.</p><button type="button" onClick={() => setSalvo(false)} className="mt-6 w-full rounded-2xl bg-[#e7d7b8] px-4 py-4 text-sm font-black text-[#24211e]">Concluir</button></div></div>}
    </main>
  );
}
