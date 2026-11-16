---
name: garimpo
description: Use quando eu pedir pra achar vídeo validado no YouTube de um nicho (outlier gringo, "o que tá bombando lá fora", tema pra modelar, ver se o Brasil já fez).
---

# Garimpo de vídeo validado

Acha vídeos gringos que furaram a bolha num assunto, confere se alguém no Brasil já fez e devolve o **esqueleto** dos melhores. É sempre o formato, nunca o texto.

Script: `node .claude/skills/garimpo/garimpo.mjs` (precisa do yt-dlp: `pip install yt-dlp`). Cada rodada grava numa pasta `analysis-garimpo-<assunto>/`.

## Passos

1. **Buscar o assunto em inglês, de dez jeitos diferentes.** Monte 10 buscas variando o ângulo: ferramenta + profissão, + resultado, + "for business", + "full tutorial" etc. Rode:
   `node .claude/skills/garimpo/garimpo.mjs busca <pasta> "busca 1" "busca 2" ...`
2. **Puxar views, inscritos, data e idioma de cada vídeo.** Rode:
   `node .claude/skills/garimpo/garimpo.mjs detalhes <pasta> [--min-views 30000] [--min-min 2] [--max-min 45]`
   Ele espera ~1 s entre um vídeo e outro. Se pedir rápido demais, o YouTube devolve 429.
3. **Jogar fora o que é velho e o que já é brasileiro, e ordenar por views ÷ inscritos.** Rode:
   `node .claude/skills/garimpo/garimpo.mjs ranking <pasta> [--dias 75]`
   Acima de 3× quer dizer que o vídeo furou a bolha do canal.
4. **Procurar o mesmo tema em português, pra ver se o Brasil já fez.** Pra cada um dos 5 melhores, monte 1 ou 2 buscas em PT (do jeito que um brasileiro digitaria) e rode:
   `node .claude/skills/garimpo/garimpo.mjs brasil <pasta> "busca pt 1" "busca pt 2" ...`
   Na lista que volta, separe o que é canal brasileiro de verdade do que é título gringo traduzido automaticamente pelo YouTube. Classifique cada tema em **buraco** (no BR o maior tem menos de 10% das views do gringo), **médio** ou **saturado**.
5. **Ler a legenda dos melhores e montar o esqueleto, sem copiar uma frase.** Rode:
   `node .claude/skills/garimpo/garimpo.mjs legenda <pasta> <id>`
   Escreva uma tabela tempo → função da parte (gancho, promessa, demo, por dentro, setup, conta de custo, CTA), o padrão do título e o tipo de CTA. Não traduza nem parafraseie o texto do criador.

## Entrega

`<pasta>/garimpo.md` com:
- a tabela dos outliers (views ÷ inscritos, views, canal, tema, já tem BR?);
- o esqueleto dos 3 a 5 melhores;
- pra cada um, o ângulo NOSSO: o mesmo formato com dado e demo próprios.

## Regras
- Copiar chega atrasado. Em 13/11/2026, três cópias brasileiras de um vídeo de 226 mil views ficaram entre 11 mil e 21 mil.
- Nada de logo oficial de terceiro nem trecho do vídeo de outro criador no nosso vídeo.
- Releia os números antes de citar: views mudam todo dia.
