import React, { useState, useRef, useEffect } from 'react';
import { Status } from '../types';

interface FilterControlsProps {
    institutions: string[];
    departments: string[];
    statuses: Status[];
    filters: {
        institutions: string[];
        departments: string[];
        statuses: Status[];
    };
    onFilterChange: (filterType: keyof FilterControlsProps['filters'], value: string[]) => void;
    onResetFilters: () => void;
    filteredCount: number;
    totalCount: number;
}

const MultiSelectDropdown: React.FC<{
    options: string[];
    selectedOptions: string[];
    onSelectionChange: (selected: string[]) => void;
    label: string;
    id: string;
}> = ({ options, selectedOptions, onSelectionChange, label, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (option: string) => {
        const newSelection = selectedOptions.includes(option)
            ? selectedOptions.filter(o => o !== option)
            : [...selectedOptions, option];
        onSelectionChange(newSelection);
    };

    const selectAll = () => onSelectionChange(options);
    const clearAll = () => onSelectionChange([]);
    
    const displayLabel = selectedOptions.length > 0 ? `${selectedOptions.length} seleccionados` : `Todos los ${label.toLowerCase()}`;

    return (
        <div className="relative" ref={dropdownRef}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen(!isOpen)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md text-left flex justify-between items-center"
            >
                <span>{displayLabel}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-md max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-200 flex gap-2">
                        <button onClick={selectAll} className="flex-1 text-xs text-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Todos</button>
                        <button onClick={clearAll} className="flex-1 text-xs text-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Ninguno</button>
                    </div>
                    <ul className="overflow-y-auto py-1">
                        {options.map(option => (
                            <li key={option}
                                className="px-3 py-2 text-sm text-gray-900 hover:bg-sky-50 cursor-pointer flex items-center gap-3"
                                onClick={() => handleToggleOption(option)}
                            >
                               <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => {}}
                                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 pointer-events-none"
                                />
                                <span>{option}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const FilterControls: React.FC<FilterControlsProps> = ({
    institutions,
    departments,
    statuses,
    filters,
    onFilterChange,
    onResetFilters,
    filteredCount,
    totalCount
}) => {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [overflowClass, setOverflowClass] = useState('overflow-hidden');
    const hasActiveFilters = filters.institutions.length > 0 || filters.departments.length > 0 || filters.statuses.length > 0;

    useEffect(() => {
        if (isAccordionOpen) {
            // After transition, allow overflow so dropdowns can pop out
            const timer = setTimeout(() => {
                setOverflowClass('overflow-visible');
            }, 500); // Must match the transition duration
            return () => clearTimeout(timer);
        } else {
            // When closing, immediately hide overflow to enable animation
            setOverflowClass('overflow-hidden');
        }
    }, [isAccordionOpen]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm relative z-30">
            {/* Accordion Header */}
            <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50/50 transition-colors rounded-lg"
                aria-expanded={isAccordionOpen}
            >
                <div className="flex items-center gap-3">
                     <span className={`p-2 rounded-full transition-colors ${hasActiveFilters ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46V19l4 2v-8.46L22 3"/></svg>
                     </span>
                    <div>
                        <h3 className="font-bold text-gray-800">
                           {hasActiveFilters ? 'Filtros Aplicados' : 'Filtrar Estudiantes'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {hasActiveFilters 
                                ? `Mostrando ${filteredCount} de ${totalCount} estudiantes`
                                : `Mostrando todos los ${totalCount} estudiantes`
                            }
                        </p>
                    </div>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transform transition-transform duration-300 text-gray-500 ${isAccordionOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {/* Collapsible Content */}
            <div className={`transition-all duration-500 ease-in-out ${overflowClass} ${isAccordionOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MultiSelectDropdown
                            id="institution-filter"
                            label="Institución"
                            options={institutions}
                            selectedOptions={filters.institutions}
                            onSelectionChange={(selected) => onFilterChange('institutions', selected)}
                        />
                        <MultiSelectDropdown
                            id="department-filter"
                            label="Departamento"
                            options={departments}
                            selectedOptions={filters.departments}
                            onSelectionChange={(selected) => onFilterChange('departments', selected)}
                        />
                         <MultiSelectDropdown
                            id="status-filter"
                            label="Estado"
                            options={statuses}
                            selectedOptions={filters.statuses}
                            onSelectionChange={(selected) => onFilterChange('statuses', selected)}
                        />
                        
                        {/* Reset Button */}
                        <div className="flex items-end">
                            <button
                                onClick={onResetFilters}
                                disabled={!hasActiveFilters}
                                className="w-full h-fit flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterControls;