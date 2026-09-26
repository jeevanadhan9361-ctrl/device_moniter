/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Plus, CheckCircle2, AlertOctagon, Terminal, Copy, Check } from 'lucide-react';
import { PRODUCTION_SIGMA_RULES, SigmaRule } from '../../services/sigmaRuleEngine';

export const SigmaRulesView: React.FC = () => {
  const [rules, setRules] = useState<SigmaRule[]>(PRODUCTION_SIGMA_RULES);
  const [selectedRule, setSelectedRule] = useState<SigmaRule>(PRODUCTION_SIGMA_RULES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyYaml = () => {
    const yaml = `title: ${selectedRule.title}
id: ${selectedRule.id}
status: ${selectedRule.status}
description: ${selectedRule.description}
author: ${selectedRule.author}
logsource:
  category: ${selectedRule.logsource.category}
  product: ${selectedRule.logsource.product}
detection:
  selection:
${Object.entries(selectedRule.detection.selection)
  .map(([k, v]) => `    ${k}: ${Array.isArray(v) ? `\n      - ${v.join('\n      - ')}` : v}`)
  .join('\n')}
  condition: ${selectedRule.detection.condition}
level: ${selectedRule.severity}
tags:
  - attack.${selectedRule.mitre_technique.replace(/, /g, '\n  - attack.')}`;

    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Production Detection Engine &amp; Sigma Rules
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Module 4: Standardized generic behavioral signatures detecting Monect, remote camera streaming, and unauthorized handle injection
          </p>
        </div>

        <button
          onClick={handleCopyYaml}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied YAML!' : 'Export Rule (YAML)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Rule List */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold block">
            Loaded Detection Signatures ({rules.length})
          </span>

          <div className="space-y-2">
            {rules.map((r) => {
              const isSelected = selectedRule.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRule(r)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        r.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {r.severity}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white tracking-tight mb-1">
                    {r.title}
                  </h4>

                  <span className="text-[10px] font-mono text-slate-500 block">
                    ATT&amp;CK: {r.mitre_technique}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (2/3): Rule Inspector */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  RULE ID: {selectedRule.id}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: {selectedRule.logsource.product} / {selectedRule.logsource.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5">
                {selectedRule.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedRule.description}
              </p>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                Detection Logic &amp; Matching Conditions
              </span>

              <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2">
                <div className="text-cyan-400 font-bold">detection.selection:</div>
                {Object.entries(selectedRule.detection.selection).map(([k, v]) => (
                  <div key={k} className="pl-4 flex items-start gap-2">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-emerald-300">
                      {Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <span className="text-slate-400">condition:</span>
                  <span className="text-white font-bold">{selectedRule.detection.condition}</span>
                </div>
              </div>
            </div>

            {/* MITRE Mapping */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Author: {selectedRule.author}</span>
              <span>MITRE Technique: <strong className="text-white">{selectedRule.mitre_technique}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
