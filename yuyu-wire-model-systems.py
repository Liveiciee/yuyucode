#!/usr/bin/env python3
# yuyu-wire-model-systems.py — wire getSystemForModel ke buildSystemPrompt

with open('src/hooks/useAgentLoop.js', 'r') as f:
    c = f.read()

# 1. Import getSystemForModel
old_import = "import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL } from '../constants.js';"
new_import  = "import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL, getSystemForModel } from '../constants.js';"
c = c.replace(old_import, new_import, 1)

# 2. buildSystemPrompt — ganti BASE_SYSTEM dengan getSystemForModel(model)
old_return = "    return BASE_SYSTEM + cfg.systemSuffix + thinkNote + styleCtx +"
new_return  = "    const modelSystem = getSystemForModel(cfg.model || project?.model || '');\n    return modelSystem + cfg.systemSuffix + thinkNote + styleCtx +"
c = c.replace(old_return, new_return, 1)

# 3. Pass model ke buildSystemPrompt cfg
old_cfg = "      const systemPrompt = buildSystemPrompt(txt, cfg);"
new_cfg  = "      const systemPrompt = buildSystemPrompt(txt, { ...cfg, model: project.model });"
c = c.replace(old_cfg, new_cfg, 1)

old_iter = "          ? buildSystemPrompt(txt, { ...cfg, _iter: iter })"
new_iter  = "          ? buildSystemPrompt(txt, { ...cfg, _iter: iter, model: project.model })"
c = c.replace(old_iter, new_iter, 1)

with open('src/hooks/useAgentLoop.js', 'w') as f:
    f.write(c)
print("✅ useAgentLoop.js — wired to getSystemForModel")
