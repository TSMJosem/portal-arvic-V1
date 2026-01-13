/**
 * UserModal.js
 * 
 * Responsabilidad: Interfaz de usuario (UI) para gestión de usuarios
 * Principio SOLID: Single Responsibility - Solo maneja la interfaz
 * 
 * Este componente:
 * - Muestra modales (crear, editar)
 * - Captura datos de formularios
 * - Llama a UserService (NO maneja lógica de negocio)
 * - Muestra notificaciones de éxito/error
 */

export class UserModal {
    /**
     * @param {UserService} userService - Servicio de lógica de negocio
     * @param {Object} notifier - Sistema de notificaciones (window.NotificationUtils)
     */
    constructor(userService, notifier) {
        if (!userService) {
            throw new Error('UserModal requiere UserService');
        }
        if (!notifier) {
            throw new Error('UserModal requiere NotificationUtils');
        }
        
        this.userService = userService;
        this.notifier = notifier;
        this.currentModal = null;
    }

    /**
     * Abrir modal de edición de usuario
     * @param {string} userId - ID del usuario a editar
     */
    async openEdit(userId) {
        try {
            console.log(`UserModal.openEdit(${userId})`);

            // Obtener datos del usuario
            const user = await this.userService.getById(userId);
            
            if (!user) {
                this.notifier.error('Usuario no encontrado');
                return;
            }

            // Renderizar modal
            this.renderEditModal(user);
            
            // Adjuntar event handlers
            this.attachEditHandlers(userId);

        } catch (error) {
            console.error('Error en openEdit:', error);
            this.notifier.error('Error al abrir modal de edición');
        }
    }

    /**
     * Renderizar HTML del modal de edición
     * @param {Object} user - Datos del usuario
     */
    renderEditModal(user) {
        const modalHTML = `
            <div class="modal" id="editUserModal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            Editar Usuario          
                        </h2>
                        <button class="close" onclick="window.userModule.closeEditModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="editUserForm" class="admin-form">
                            <input type="hidden" id="editUserId" value="${user.userId}">
                            
                            <!-- ID de Usuario (no editable) -->
                            <div class="form-group">
                                <label>ID de Usuario</label>
                                <input type="text" value="${user.userId}" disabled 
                                       style="background: #f5f5f5; cursor: not-allowed; color: #666;">
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">
                                   El ID no puede modificarse
                                </small>
                            </div>
                            
                            <!-- Nombre -->
                            <div class="form-group">
                                <label for="editUserName">
                                   Nombre Completo *
                                </label>
                                <input type="text" 
                                       id="editUserName" 
                                       value="${user.name}" 
                                       placeholder="Ej: Juan Pérez García" 
                                       required>
                            </div>
                            
                            <!-- Email -->
                            <div class="form-group">
                                <label for="editUserEmail">
                                   Email
                                </label>
                                <input type="email" 
                                       id="editUserEmail" 
                                       value="${user.email || ''}" 
                                       placeholder="usuario@empresa.com">
                            </div>
                            
                            <!-- Nueva Contraseña -->
                            <div class="form-group">
                                <label for="editUserPassword">
                                    Nueva Contraseña
                                </label>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" 
                                           id="editUserPassword" 
                                           placeholder="cons1234.5678"
                                           style="flex: 1;">
                                    <button type="button" 
                                            class="btn btn-secondary" 
                                            id="generatePasswordBtn"
                                            style="white-space: nowrap; padding: 0 15px;"
                                            title="Generar contraseña aleatoria única">
                                        <i class="fa-solid fa-rotate"></i> Generar
                                    </button>
                                </div>
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">
                                    <i class="fa-solid fa-info-circle"></i> Formato requerido: 
                                    <code style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px;">cons####.####</code>
                                    (cons + 4 dígitos + punto + 4 dígitos)
                                </small>
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 3px;">
                                    Ejemplo: 
                                    <code style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">cons1234.5678</code>
                                </small>
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 3px;">
                                    Dejar vacío para mantener la contraseña actual
                                </small>
                                <small style="color: #e74c3c; font-size: 0.85rem; display: block; margin-top: 5px;">
                                    <strong>Importante:</strong> Por seguridad, cada consultor debe tener una contraseña única
                                </small>
                            </div>
                            
                            <!-- Mensaje informativo -->
                            <div class="message message-info" style="margin-top: 20px;">
                                <strong>Nota:</strong> Los cambios se aplicarán inmediatamente al guardar.
                            </div>
                            
                            <!-- Botones de acción -->
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                                <button type="button" 
                                        class="btn btn-secondary" 
                                        onclick="window.userModule.closeEditModal()">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const existingModal = document.getElementById('editUserModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Insertar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.currentModal = document.getElementById('editUserModal');
    }

    /**
     * Adjuntar event handlers al modal de edición
     * @param {string} userId - ID del usuario
     */
    attachEditHandlers(userId) {
        // Handler para el formulario (submit)
        const form = document.getElementById('editUserForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditSubmit(userId);
            });
        }

        // Handler para generar contraseña
        const generateBtn = document.getElementById('generatePasswordBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', async () => {
                await this.handleGeneratePassword(userId);
            });
        }
    }

    /**
     * Manejar el envío del formulario de edición
     * @param {string} userId - ID del usuario
     */
    async handleEditSubmit(userId) {
        try {
            console.log(`Enviando actualización de usuario ${userId}`);

            // Capturar datos del formulario
            const formData = {
                name: document.getElementById('editUserName').value.trim(),
                email: document.getElementById('editUserEmail').value.trim(),
                password: document.getElementById('editUserPassword').value.trim()
            };

            // Preparar datos de actualización
            const updateData = {
                name: formData.name,
                email: formData.email || `${userId.toLowerCase()}@grupoitarvic.com`,
                updatedAt: new Date().toISOString()
            };

            // Solo incluir contraseña si se proporcionó una nueva
            if (formData.password) {
                updateData.password = formData.password;
            }

            //console.log('📋 Datos a actualizar:', updateData);

            // Llamar al servicio (él valida y guarda)
            const result = await this.userService.update(userId, updateData);

            // Mostrar mensaje de éxito
            if (result.passwordChanged) {
                this.notifier.success(
                    `Usuario actualizado exitosamente.\n\n` +
                    `Nueva contraseña: ${formData.password}\n\n` +
                    `IMPORTANTE: Comparta esta contraseña de forma segura con el consultor.`
                );
            } else {
                this.notifier.success('Usuario actualizado correctamente');
            }

            // Cerrar modal
            this.closeEditModal();

            // Recargar datos (compatibilidad con código legacy)
            if (typeof window.loadAllData === 'function') {
                await window.loadAllData();
            }

            console.log('Actualización completada');

        } catch (error) {
            console.error('Error en handleEditSubmit:', error);
            this.notifier.error(error.message || 'Error al actualizar usuario');
        }
    }

    /**
     * Generar contraseña única y mostrarla en el campo
     * @param {string} excludeUserId - Usuario a excluir (el actual)
     */
    async handleGeneratePassword(excludeUserId) {
        try {
            console.log('Generando contraseña única...');

            const password = await this.userService.generatePassword(excludeUserId);
            
            // Establecer en el input
            const passwordInput = document.getElementById('editUserPassword');
            if (passwordInput) {
                passwordInput.value = password;
            }

            // Feedback visual
            this.notifier.success(`Contraseña generada: ${password}`);

            //console.log('✅ Contraseña generada:', password);

        } catch (error) {
            console.error('Error generando contraseña:', error);
            this.notifier.error('Error al generar contraseña');
        }
    }

    /**
     * Cerrar el modal de edición
     */
    closeEditModal() {
        const modal = document.getElementById('editUserModal');
        if (modal) {
            modal.remove();
            this.currentModal = null;
        }
    }

    /**
     * Abrir modal de creación de usuario
     * (Implementación futura si es necesario)
     */
    async openCreate() {
        // TODO: Implementar si se necesita en el futuro
        console.log('openCreate() - Por implementar');
        this.notifier.warning('Funcionalidad en desarrollo');
    }
}