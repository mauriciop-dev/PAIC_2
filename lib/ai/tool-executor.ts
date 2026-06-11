import { supabaseAdmin } from '../supabaseAdmin';
import { toSupabase, fromSupabase } from '../../utils/dbMappers';

export async function executeToolLocally(
  name: string,
  args: any,
  conjuntoId: string
): Promise<string> {
  console.log(`Executing tool on backend: ${name}`, args, `for conjunto: ${conjuntoId}`);

  try {
    switch (name) {
      // --- Resident Management ---
      case 'addResident': {
        const { apartment, name: residentName, email, phone } = args;
        if (!apartment) throw new Error("Faltan datos del residente (apartamento).");
        
        const payload = toSupabase({ apartment, name: residentName, email, phone });
        const { error } = await supabaseAdmin
          .from('residents')
          .upsert({ ...payload, conjunto_id: conjuntoId }, { onConflict: 'conjunto_id, apartment' });
        
        if (error) throw error;
        return `¡Confirmado! Residente para el apto **${apartment}** agregado exitosamente.`;
      }

      case 'updateResident': {
        const { apartment, data } = args;
        if (!apartment) throw new Error("Falta el número de apartamento.");
        
        const payload = toSupabase(data);
        const { error } = await supabaseAdmin
          .from('residents')
          .update(payload)
          .eq('conjunto_id', conjuntoId)
          .eq('apartment', apartment);
          
        if (error) throw error;
        return `¡Confirmado! La información del residente del apto **${apartment}** ha sido actualizada.`;
      }

      case 'deleteResident': {
        const { apartment } = args;
        if (!apartment) throw new Error("Falta el número de apartamento.");
        
        const { error } = await supabaseAdmin
          .from('residents')
          .delete()
          .eq('conjunto_id', conjuntoId)
          .eq('apartment', apartment);
          
        if (error) throw error;
        return `¡Confirmado! El residente del apto **${apartment}** ha sido eliminado.`;
      }

      // --- Provider Management ---
      case 'addProvider': {
        const { company, specialty, email, phone } = args;
        if (!company) throw new Error("Faltan datos del proveedor (empresa).");
        
        const payload = toSupabase({ company, specialty, email, phone });
        const { error } = await supabaseAdmin
          .from('providers')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `¡Confirmado! Proveedor **${company}** agregado exitosamente.`;
      }

      case 'updateProvider': {
        const { company, data } = args;
        if (!company) throw new Error("Falta el nombre de la empresa.");
        
        const { data: providers, error: fetchErr } = await supabaseAdmin
          .from('providers')
          .select('*')
          .eq('conjunto_id', conjuntoId);
          
        if (fetchErr) throw fetchErr;
        
        const matching = (providers || []).filter(p => p.company.toLowerCase() === company.toLowerCase());
        if (matching.length === 0) throw new Error(`No se encontró un proveedor con el nombre "${company}".`);
        if (matching.length > 1) return `Encontré varios proveedores con el nombre "${company}". Por favor, sé más específico.`;
        
        const providerToUpdate = matching[0];
        const payload = toSupabase(data);
        
        const { error: updateErr } = await supabaseAdmin
          .from('providers')
          .update(payload)
          .eq('conjunto_id', conjuntoId)
          .eq('id', providerToUpdate.id);
          
        if (updateErr) throw updateErr;
        return `¡Confirmado! La información del proveedor **${company}** ha sido actualizada.`;
      }

      case 'deleteProvider': {
        const { company } = args;
        if (!company) throw new Error("Falta el nombre de la empresa.");
        
        const { data: providers, error: fetchErr } = await supabaseAdmin
          .from('providers')
          .select('*')
          .eq('conjunto_id', conjuntoId);
          
        if (fetchErr) throw fetchErr;
        
        const matching = (providers || []).filter(p => p.company.toLowerCase() === company.toLowerCase());
        if (matching.length === 0) throw new Error(`No se encontró un proveedor con el nombre "${company}".`);
        if (matching.length > 1) return `Encontré varios proveedores con el nombre "${company}". Por favor, sé más específico.`;
        
        const providerToDelete = matching[0];
        const { error: deleteErr } = await supabaseAdmin
          .from('providers')
          .delete()
          .eq('conjunto_id', conjuntoId)
          .eq('id', providerToDelete.id);
          
        if (deleteErr) throw deleteErr;
        return `¡Confirmado! El proveedor **${company}** ha sido eliminado.`;
      }

      // --- Internal Staff ---
      case 'addInternalStaff': {
        const { name: staffName, position, email, phone } = args;
        if (!staffName) throw new Error("Faltan datos del personal (nombre).");
        
        const payload = toSupabase({ name: staffName, position, email, phone });
        const { error } = await supabaseAdmin
          .from('internal_staff')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `¡Confirmado! Miembro del personal **${staffName}** agregado exitosamente.`;
      }

      case 'updateInternalStaff': {
        const { name: staffName, data } = args;
        if (!staffName) throw new Error("Falta el nombre de la persona.");
        
        const payload = toSupabase(data);
        const { error } = await supabaseAdmin
          .from('internal_staff')
          .update(payload)
          .eq('conjunto_id', conjuntoId)
          .eq('name', staffName);
          
        if (error) throw error;
        return `¡Confirmado! La información de **${staffName}** ha sido actualizada.`;
      }

      case 'deleteInternalStaff': {
        const { name: staffName } = args;
        if (!staffName) throw new Error("Falta el nombre de la persona.");
        
        const { error } = await supabaseAdmin
          .from('internal_staff')
          .delete()
          .eq('conjunto_id', conjuntoId)
          .eq('name', staffName);
          
        if (error) throw error;
        return `¡Confirmado! El miembro del personal **${staffName}** ha sido eliminado.`;
      }

      // --- Reservations ---
      case 'createReservation': {
        const { commonAreaName, apartment, date, startTime, endTime } = args;
        if (!commonAreaName || !apartment || !date) {
          throw new Error("Faltan datos para crear la reserva (área, apartamento o fecha).");
        }

        // 1. Fetch common area
        const { data: area, error: areaErr } = await supabaseAdmin
          .from('common_areas')
          .select('id, name')
          .eq('conjunto_id', conjuntoId)
          .ilike('name', `%${commonAreaName.trim()}%`)
          .maybeSingle();

        if (areaErr || !area) {
          throw new Error(`No se encontró un área común llamada "${commonAreaName}".`);
        }

        // 2. Fetch resident details
        const { data: resident, error: resErr } = await supabaseAdmin
          .from('residents')
          .select('*')
          .eq('conjunto_id', conjuntoId)
          .eq('apartment', apartment)
          .maybeSingle();

        if (resErr || !resident) {
          throw new Error(`No se encontró un residente para el apartamento "${apartment}".`);
        }

        // 3. Insert reservation
        const resPayload = toSupabase({
          apartment,
          residentName: resident.name,
          commonAreaId: area.id,
          date,
          startTime,
          endTime,
          email: resident.email,
          phone: resident.phone
        });

        const { error: insertErr } = await supabaseAdmin
          .from('reservations')
          .insert({ ...resPayload, conjunto_id: conjuntoId });

        if (insertErr) throw insertErr;

        return `¡Confirmado! La reserva del área **${commonAreaName}** para el **Apto ${apartment}** el **${date}** de **${startTime} a ${endTime}** ha sido registrada exitosamente.`;
      }

      // --- Queries ---
      case 'queryDatabase': {
        const { table, query_description } = args;
        const aptMatch = query_description.match(/\d+/);
        const apt = aptMatch ? aptMatch[0] : null;

        if (table === 'account_status' && apt) {
          const { data, error } = await supabaseAdmin
            .from('account_status')
            .select('*')
            .eq('conjunto_id', conjuntoId)
            .eq('apartment', apt)
            .maybeSingle();
            
          if (error) throw error;
          if (data) {
            const mapped = fromSupabase(data);
            return `El saldo pendiente del Apto ${apt} es de $${mapped.outstandingBalance.toLocaleString('es-CO')}. Último pago: ${mapped.lastPaymentDate}.`;
          }
          return `No encontré información de estado de cuenta para el Apto ${apt}.`;
        }

        if (table === 'residents' && apt) {
          const { data, error } = await supabaseAdmin
            .from('residents')
            .select('*')
            .eq('conjunto_id', conjuntoId)
            .eq('apartment', apt)
            .maybeSingle();
            
          if (error) throw error;
          if (data) {
            const mapped = fromSupabase(data);
            return `Residente del Apto ${apt}:\n- Nombre: ${mapped.name}\n- Email: ${mapped.email}\n- Teléfono: ${mapped.phone}`;
          }
          return `No encontré un residente para el Apto ${apt}.`;
        }

        return `No pude procesar la consulta: "${query_description}". Intenta de nuevo.`;
      }

      case 'queryDebtors': {
        const { data, error } = await supabaseAdmin.rpc('get_debtors', { p_conjunto_id: conjuntoId });
        if (error) throw error;
        
        const debtors = data || [];
        if (debtors.length === 0) return "¡Buenas noticias! No hay residentes en mora en este momento.";
        const debtorsList = debtors.map((d: any) => `- Apto ${d.apartment} (${d.name}): $${d.balance.toLocaleString('es-CO')}`).join('\n');
        return `Claro, aquí está la lista de residentes en mora:\n\n${debtorsList}`;
      }

      case 'queryProviders': {
        const { specialty } = args;
        let query = supabaseAdmin.from('providers').select('*').eq('conjunto_id', conjuntoId);
        if (specialty) {
          query = query.ilike('specialty', `%${specialty}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        const providers = fromSupabase(data || []);
        if (providers.length === 0) {
          return specialty ? `No encontré proveedores con la especialidad "${specialty}".` : `No hay proveedores registrados.`;
        }
        
        const providersList = providers.map((p: any) => `- ${p.company} (${p.specialty}) - Contacto: ${p.phone || 'N/A'}, ${p.email || 'N/A'}`).join('\n');
        return `Entendido. Consulté la base de datos y encontré estos proveedores:\n\n${providersList}`;
      }

      case 'sendMassEmail': {
        const { group } = args;
        return `Simulación: Correo enviado al grupo ${group}.`;
      }

      // --- Financial Transactions ---
      case 'addIncome': {
        const { description, amount, category, date } = args;
        if (!amount || !description) throw new Error("Faltan datos del ingreso (monto o descripción).");
        
        const payload = toSupabase({ description, amount, category, date });
        const { error } = await supabaseAdmin
          .from('incomes')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `Ingreso de $${amount.toLocaleString('es-CO')} por "${description}" agregado. ¿Necesitas algo más?`;
      }

      case 'addExpense': {
        const { description, amount, category, date, providerId } = args;
        if (!amount || !description) throw new Error("Faltan datos del gasto (monto o descripción).");
        
        const payload = toSupabase({ description, amount, category, date, providerId });
        const { error } = await supabaseAdmin
          .from('expenses')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `Gasto de $${amount.toLocaleString('es-CO')} por "${description}" agregado. ¿Necesitas algo más?`;
      }

      // --- Security Logs ---
      case 'authorizeVisitor': {
        const { visitorName, apartment, date } = args;
        if (!visitorName || !apartment) throw new Error("Faltan datos del visitante.");
        
        const payload = toSupabase({ visitorName, apartment, date, status: 'Autorizado' });
        const { error } = await supabaseAdmin
          .from('visitor_logs')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `Visitante "${visitorName}" autorizado para el Apto ${apartment}.`;
      }

      case 'registerPackage': {
        const { apartment, courier, trackingNumber } = args;
        if (!apartment || !courier) throw new Error("Faltan datos del paquete.");
        
        const payload = toSupabase({ apartment, courier, trackingNumber, status: 'En recepción' });
        const { error } = await supabaseAdmin
          .from('package_logs')
          .insert({ ...payload, conjunto_id: conjuntoId });
          
        if (error) throw error;
        return `Paquete de "${courier}" para el Apto ${apartment} registrado.`;
      }

      case 'updateVisitorStatus': {
        const { logId, status } = args;
        if (!logId || !status) throw new Error("Faltan datos para actualizar el estado del visitante.");
        
        if (!['Autorizado', 'Ingresó', 'Salió'].includes(status)) {
          return `El estado "${status}" no es válido. Los estados permitidos son: Autorizado, Ingresó, Salió.`;
        }

        const { error } = await supabaseAdmin
          .from('visitor_logs')
          .update({ status })
          .eq('conjunto_id', conjuntoId)
          .eq('id', logId);
          
        if (error) throw error;
        return `Estado del visitante actualizado a "${status}".`;
      }

      default:
        return `No entendí la acción: ${name}.`;
    }
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return `Lo siento, no pude completar la operación. Motivo: ${error.message || 'Error desconocido'}`;
  }
}
