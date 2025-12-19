// src/bootstrap-init.ts
import { Tooltip, Dropdown } from 'bootstrap';

// Inicializa tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl);
});

// Inicializa dropdowns
const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
dropdownElementList.map(function (dropdownToggleEl) {
    return new Dropdown(dropdownToggleEl);
});

// Manejo de submenús
document.querySelectorAll('.dropdown-menu a.dropdown-toggle').forEach(element => {
    element.addEventListener('click', function(this: HTMLElement, e: Event) {
        e.preventDefault();
        e.stopPropagation();
        const parent = this.parentElement;
        if (parent) {
            const dropdownMenu = this.nextElementSibling as HTMLElement;
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
                parent.classList.toggle('show');
            }
        }
    });
});