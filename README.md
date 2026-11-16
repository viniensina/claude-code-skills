# Claude Code skills (PT-BR)

Skills que eu uso no meu Claude Code pra produzir conteúdo, do canal **Vini Ensina** no YouTube e do [@viniensina_](https://instagram.com/viniensina_) no Instagram.

Uma skill é só uma pasta com um `SKILL.md` (as instruções) e, se precisar, os scripts que ela usa. O Claude Code lê a descrição e usa a skill sozinho quando o pedido bate com ela.

## Skills

| Skill | O que faz |
|---|---|
| [garimpo](skills/garimpo/) | Acha vídeo gringo que furou a bolha num assunto (views ÷ inscritos), confere se alguém no Brasil já fez e monta o esqueleto dos melhores, sem copiar o texto. |

## Como instalar

1. Copie a pasta da skill pra dentro do teu projeto, em `.claude/skills/`:
   ```
   teu-projeto/.claude/skills/garimpo/SKILL.md
   teu-projeto/.claude/skills/garimpo/garimpo.mjs
   ```
   Pra ter em todos os projetos, use `~/.claude/skills/garimpo/`. Nesse caso, ajuste o caminho do script no `SKILL.md`.
2. O garimpo precisa do [Node.js](https://nodejs.org) e do [yt-dlp](https://github.com/yt-dlp/yt-dlp):
   ```
   pip install yt-dlp
   ```
3. Abra o Claude Code no projeto e peça, por exemplo:
   > acha vídeo validado lá fora sobre Claude Code pra negócio local

## Garimpo em uma frase

Copiar chega atrasado. Em 13/11/2026, três cópias brasileiras de um vídeo gringo de 226 mil views ficaram entre 11 mil e 21 mil. O que funciona é pegar o **formato** que furou e encher com o teu dado e a tua demo.

## Licença

MIT. Use, mude e compartilhe à vontade.
