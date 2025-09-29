function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      var params = e.parameter || {};
      var raw = params.payload || e.postData.contents;
      try { 
        data = JSON.parse(raw); 
      } catch (err) {
        Logger.log("Error parseando payload: " + err);
      }
    }

    if (!data || !data.name || !data.email || !Array.isArray(data.cart)) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "bad_request" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var brandColor = '#2563eb';
    var backgroundColor = '#f3f4f6';
    var cardBackground = '#ffffff';
    var textColor = '#1f2937';
    var mutedColor = '#6b7280';
    var borderColor = '#e5e7eb';
    var accentBackground = '#eff6ff';

    var formatMoney = function(value) {
      return 'USD $' + Number(value || 0).toFixed(2);
    };

    var rows = data.cart.map(function(it, i) {
      var qty = it.qty || 1;
      var price = Number(it.price || 0);
      var subtotal = price * qty;
      return [
        '<tr>',
        '<td style="padding:12px 16px;border-bottom:1px solid ' + borderColor + ';color:' + mutedColor + ';font-weight:600;font-size:13px;">' + (i + 1) + '</td>',
        '<td style="padding:12px 16px;border-bottom:1px solid ' + borderColor + ';color:' + textColor + ';font-size:14px;">' + (it.name || '') + '</td>',
        '<td style="padding:12px 16px;border-bottom:1px solid ' + borderColor + ';color:' + textColor + ';font-size:14px;" align="right">' + formatMoney(price) + '</td>',
        '<td style="padding:12px 16px;border-bottom:1px solid ' + borderColor + ';color:' + textColor + ';font-size:14px;" align="center">' + qty + '</td>',
        '<td style="padding:12px 16px;border-bottom:1px solid ' + borderColor + ';color:' + textColor + ';font-size:14px;" align="right">' + formatMoney(subtotal) + '</td>',
        '</tr>'
      ].join('');
    }).join('');

    if (!rows) {
      rows = '<tr><td colspan="5" style="padding:16px;text-align:center;color:' + mutedColor + ';font-size:14px;border-bottom:1px solid ' + borderColor + ';">Sin servicios seleccionados</td></tr>';
    }

    var totalValue = data.total != null ? Number(data.total) : data.cart.reduce(function(sum, item) {
      var qty = item.qty || 1;
      var price = Number(item.price || 0);
      return sum + price * qty;
    }, 0);
    var totalDisplay = formatMoney(totalValue);
    var wantsWhatsapp = Boolean(data.whatsappOptIn);
    var whatsappNumber = (data.whatsappNumber || '').trim();
    var whatsappDisplay = wantsWhatsapp ? ('Sí' + (whatsappNumber ? ' — ' + whatsappNumber : '')) : 'No';

    var styleBlock = [
      '<style type="text/css">',
      '  @media (max-width: 640px) {',
      '    .email-container { width:100% !important; max-width:100% !important; border-radius:16px !important; }',
      '    .email-header { padding:28px 20px 16px !important; }',
      '    .email-section { padding:20px 20px !important; }',
      '    .email-table { border-radius:14px !important; }',
      '    .email-table th, .email-table td { padding:12px 12px !important; font-size:13px !important; }',
      '    .email-total-label, .email-total-value { font-size:15px !important; padding:14px 16px !important; }',
      '    .email-footer { padding:0 20px 24px !important; }',
      '    .email-title { font-size:22px !important; }',
      '    .email-paragraph { font-size:14px !important; }',
      '    .email-badge { font-size:11px !important; }',
      '  }',
      '</style>'
    ].join('');

    var html = [
      styleBlock,
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:' + backgroundColor + ';padding:32px 0;margin:0;">',
      '  <tr>',
      '    <td>',
      '      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:600px;background:' + cardBackground + ';border-radius:20px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.08);font-family:\'Segoe UI\',Roboto,Arial,sans-serif;color:' + textColor + ';" class="email-container">',
      '        <tr>',
      '          <td style="padding:32px 32px 16px;text-align:center;background:linear-gradient(135deg,' + brandColor + ',#1d4ed8);color:#ffffff;" class="email-header">',
      '            <span class="email-badge" style="display:inline-block;padding:8px 16px;margin-bottom:12px;border-radius:999px;background:rgba(255,255,255,0.15);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">Nuevo pedido</span>',
      '            <h1 class="email-title" style="margin:0;font-size:26px;font-weight:700;line-height:1.2;">Tienes un nuevo pedido de servicios</h1>',
      '            <p class="email-paragraph" style="margin:12px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">Revisa los detalles y responde al cliente para continuar.</p>',
      '          </td>',
      '        </tr>',
      '        <tr>',
      '          <td style="padding:24px 32px;" class="email-section">',
      '            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:14px;background:' + accentBackground + ';padding:18px;border:1px solid ' + borderColor + ';">',
      '              <tr>',
      '                <td style="font-size:14px;line-height:1.7;color:' + textColor + ';">',
      '                  <strong style="color:' + brandColor + ';">Detalles del cliente</strong><br>',
      '                  <span style="color:' + mutedColor + ';">Nombre</span><br>',
      '                  <span style="font-weight:600;">' + (data.name || '') + '</span><br>',
      '                  <span style="color:' + mutedColor + ';">Email</span><br>',
      '                  <a href="mailto:' + (data.email || '') + '" style="color:' + brandColor + ';text-decoration:none;font-weight:600;">' + (data.email || '') + '</a><br>',
      '                  <span style="color:' + mutedColor + ';">Empresa</span><br>',
      '                  <span>' + (data.company || 'Sin especificar') + '</span><br>',
      '                  <span style="color:' + mutedColor + ';">WhatsApp</span><br>',
      '                  <span>' + whatsappDisplay + '</span><br>',
      '                  <span style="color:' + mutedColor + ';">Fecha</span><br>',
      '                  <span>' + (new Date()).toLocaleString() + '</span>',
      '                </td>',
      '              </tr>',
      '            </table>',
      '          </td>',
      '        </tr>',
      '        <tr>',
      '          <td style="padding:0 32px 24px;" class="email-section">',
      '            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid ' + borderColor + ';border-radius:14px;overflow:hidden;" class="email-table">',
      '              <thead>',
      '                <tr style="background:' + brandColor + ';color:#ffffff;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">',
      '                  <th align="left" style="padding:12px 16px;">#</th>',
      '                  <th align="left" style="padding:12px 16px;">Servicio</th>',
      '                  <th align="right" style="padding:12px 16px;">Precio</th>',
      '                  <th align="center" style="padding:12px 16px;">Cant.</th>',
      '                  <th align="right" style="padding:12px 16px;">Subtotal</th>',
      '                </tr>',
      '              </thead>',
      '              <tbody>' + rows + '</tbody>',
      '              <tfoot>',
      '                <tr>',
      '                  <td colspan="5" style="padding:0;">',
      '                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">',
      '                      <tr>',
      '                        <td class="email-total-label" style="padding:16px 20px;text-align:right;font-size:16px;font-weight:700;color:' + textColor + ';">Total</td>',
      '                        <td class="email-total-value" style="padding:16px 20px;text-align:right;font-size:16px;font-weight:700;color:' + brandColor + ';">' + totalDisplay + '</td>',
      '                      </tr>',
      '                    </table>',
      '                  </td>',
      '                </tr>',
      '              </tfoot>',
      '            </table>',
      '          </td>',
      '        </tr>',
      '        <tr>',
      '          <td style="padding:0 32px 32px;" class="email-footer">',
      '            <p style="margin:0;font-size:14px;line-height:1.7;color:' + mutedColor + ';">Gracias por confiar en nosotros. Responde a este correo con cualquier duda o para coordinar los siguientes pasos.</p>',
      '            <p style="margin:16px 0 0;font-size:14px;font-weight:600;color:' + textColor + ';">Equipo ServiciosTech</p>',
      '          </td>',
      '        </tr>',
      '      </table>',
      '    </td>',
      '  </tr>',
      '</table>'
    ].join('');

    MailApp.sendEmail({
      to: "ezratawachi@gmail.com",
      subject: "Nuevo pedido (Servicios) - " + (data.name || ""),
      htmlBody: html
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error en doPost: " + err);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
