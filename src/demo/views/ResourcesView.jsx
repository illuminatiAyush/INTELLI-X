import React, { useState } from 'react';
import { 
  FolderArchive, 
  Plus, 
  Download, 
  FileText, 
  Upload, 
  X, 
  Check, 
  Filter
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const ResourcesView = () => {
  const { currentRole, resources, batches, uploadResource, showToast } = useDemo();

  const [filterBatch, setFilterBatch] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    batchId: 'batch-1',
    category: 'Formula Sheet',
    size: '3.4 MB'
  });

  const filteredResources = filterBatch === 'all'
    ? resources
    : resources.filter(r => r.batchId === filterBatch);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Curriculum & Study Resource Vault</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Official lecture transcripts, formula compendiums, revision problem sets, and NCERT solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-zinc-200 rounded text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Cohort Materials</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Admin & Teacher Upload Action */}
          {currentRole !== 'Student' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Resource
            </button>
          )}
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <div 
            key={res.id}
            className="p-4 bg-white border border-zinc-200 rounded-lg flex items-start justify-between gap-4 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded bg-zinc-100 border border-zinc-200 shrink-0">
                <FileText className="w-5 h-5 text-zinc-800" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">{res.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                  <span>{res.category}</span>
                  <span>·</span>
                  <span>{res.size}</span>
                  <span>·</span>
                  <span>{res.batchName}</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  Uploaded by {res.uploadedBy} on {res.date}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Downloaded ${res.title}`);
              }}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded transition-colors flex items-center gap-1 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Get
            </button>
          </div>
        ))}
      </div>

      {/* Upload Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Upload Study Material (PDF)</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Target Batch:</label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Resource Title:</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="e.g. Organic Reaction Mechanism Cheat Sheet.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Category:</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  >
                    <option value="Formula Sheet">Formula Sheet</option>
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Practice Problems">Practice Problems</option>
                    <option value="NCERT Solution">NCERT Solution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Simulated Size:</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded font-mono"
                  />
                </div>
              </div>

              {/* Mock Dropzone */}
              <div className="border-2 border-dashed border-zinc-200 rounded p-4 text-center bg-zinc-50">
                <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                <p className="text-zinc-600 font-medium">Click to select PDF or drag and drop</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Maximum file size: 25 MB</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!form.title) return alert("Please specify a resource title");
                  uploadResource(form);
                  setModalOpen(false);
                  setForm({ title: '', batchId: 'batch-1', category: 'Formula Sheet', size: '3.4 MB' });
                }}
                className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
