import React, { useState } from 'react';
import { Status } from '../types';

interface FilterControlsProps {
    institutions: string[];
    departments: string[];
    statuses: Status[];
    filters: {
        institution: string;
        department: string;
        status: string;
    };
    onFilterChange: (filterType: keyof FilterControlsProps['filters'], value: string) => void;
    onResetFilters: () => void;
    filteredCount: number;
    totalCount: number;
}

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
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = filters.institution !== 'all' || filters.department !== 'all' || filters.status !== 'all';

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Accordion Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50/50 transition-colors rounded-lg"
                aria-expanded={isOpen}
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
                    className={`transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Institution Filter */}
                        <div>
                            <label htmlFor="institution-filter" className="block text-sm font-medium text-gray-700">
                                Institución
                            </label>
                            <select
                                id="institution-filter"
                                name="institution"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                value={filters.institution}
                                onChange={(e) => onFilterChange('institution', e.target.value)}
                            >
                                <option value="all">Todas las instituciones</option>
                                {institutions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                            </select>
                        </div>
                        
                        {/* Department Filter */}
                        <div>
                            <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700">
                                Departamento
                            </label>
                            <select
                                id="department-filter"
                                name="department"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                value={filters.department}
                                onChange={(e) => onFilterChange('department', e.target.value)}
                            >
                                <option value="all">Todos los departamentos</option>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                                Estado
                            </label>
                            <select
                                id="status-filter"
                                name="status"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                value={filters.status}
                                onChange={(e) => onFilterChange('status', e.target.value)}
                            >
                                <option value="all">Todos los estados</option>
                                {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                            </select>
                        </div>
                        
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
