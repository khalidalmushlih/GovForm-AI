import React from 'react';
import { FORM_SERVICES } from '../data/forms';
import { FormType } from '../types';
import { FileText, CreditCard, HeartHandshake, Building2, Vote, Clock, CheckCircle2 } from 'lucide-react';

interface ServiceSelectorProps {
  selectedForm: FormType;
  onSelectForm: (formId: FormType) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedForm,
  onSelectForm,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="h-5 w-5" />;
      case 'CreditCard':
        return <CreditCard className="h-5 w-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="h-5 w-5" />;
      case 'Building2':
        return <Building2 className="h-5 w-5" />;
      case 'Vote':
        return <Vote className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step 1: Select Government Service
          </h2>
          <p className="text-xs text-slate-500">
            Choose an official service to initialize strict government JSON schema & validation rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FORM_SERVICES.map((srv) => {
          const isSelected = selectedForm === srv.id;
          return (
            <button
              key={srv.id}
              id={`service-card-${srv.id}`}
              onClick={() => onSelectForm(srv.id)}
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-sky-500 bg-gradient-to-b from-sky-950/40 via-slate-900 to-slate-900 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isSelected && (
                <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-400/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {getIcon(srv.icon)}
                  </div>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-300">
                    {srv.code}
                  </span>
                </div>

                <h3
                  className={`text-sm font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {srv.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                  {srv.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                <span className="text-[10px] font-medium text-slate-500">{srv.badge}</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{srv.estimatedTime.split(' ')[0]}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
