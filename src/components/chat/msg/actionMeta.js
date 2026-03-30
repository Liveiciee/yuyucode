import {
  FileText, Folder, FolderOpen, Search, Globe, Terminal, Plug, FileDiff, Trash2,
  ArrowRight, Wrench, Network, Check, X
} from 'lucide-react';
import React from 'react';

export function actionMeta(type) {
  switch (type) {
    case 'read_file':      return { icon: <FileText size={10}/>,  label: 'read',   color: null };
    case 'list_files':     return { icon: <Folder size={10}/>,    label: 'list',   color: null };
    case 'tree':           return { icon: <FolderOpen size={10}/>, label: 'tree',  color: null };
    case 'search':
    case 'find_symbol':    return { icon: <Search size={10}/>,    label: 'search', color: null };
    case 'web_search':     return { icon: <Globe size={10}/>,     label: 'web',    color: null };
    case 'exec':           return { icon: <Terminal size={10}/>,  label: 'exec',   color: '#f59e0b' };
    case 'mcp':            return { icon: <Plug size={10}/>,      label: 'mcp',    color: null };
    case 'patch_file':     return { icon: <FileDiff size={10}/>,  label: 'patch',  color: null };
    case 'append_file':    return { icon: <FileText size={10}/>,  label: 'append', color: null };
    case 'delete_file':    return { icon: <Trash2 size={10}/>,    label: 'delete', color: '#f87171' };
    case 'move_file':      return { icon: <ArrowRight size={10}/>,label: 'move',   color: null };
    case 'mkdir':          return { icon: <FolderOpen size={10}/>,label: 'mkdir',  color: null };
    case 'lint':           return { icon: <Wrench size={10}/>,    label: 'lint',   color: null };
    default:               return { icon: <Network size={10}/>,   label: type,     color: null };
  }
}
