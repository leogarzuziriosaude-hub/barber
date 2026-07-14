type ConfirmDialogProps = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  confirmarTexto: string;
  onConfirmar: () => void;
  onFechar: () => void;
};

export default function ConfirmDialog({ aberto, titulo, descricao, confirmarTexto, onConfirmar, onFechar }: ConfirmDialogProps) {
  if (!aberto) return null;
  return <div onClick={onFechar} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-neutral-900 p-6 text-center text-white shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-400/10 text-2xl font-black text-amber-400">!</div><h2 id="confirm-title" className="mt-4 text-2xl font-black">{titulo}</h2><p className="mt-2 text-sm leading-relaxed text-neutral-400">{descricao}</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={onFechar} className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-black">Voltar</button><button type="button" onClick={onConfirmar} className="rounded-2xl bg-red-500 px-4 py-4 text-sm font-black text-white">{confirmarTexto}</button></div></div></div>;
}
