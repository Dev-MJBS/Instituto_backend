import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface ContactEmailOptions {
  name: string;
  email: string;
  message: string;
}

interface SubmissionEmailOptions {
  authorName: string;
  authorEmail: string;
  title: string;
  protocol: string;
  area: string;
}

interface StatusUpdateEmailOptions {
  authorName: string;
  authorEmail: string;
  title: string;
  protocol: string;
  status: string;
  notes?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // ─── Contact Emails ────────────────────────────────────────────────────────

  async sendContactNotification(opts: ContactEmailOptions): Promise<void> {
    await this.send({
      to: process.env.EMAIL_CONTACT ?? 'mateus@institutojob.com.br',
      subject: `[IJB Contato] Nova mensagem de ${opts.name}`,
      html: `
        <h2>Nova mensagem de contato recebida</h2>
        <p><strong>Nome:</strong> ${opts.name}</p>
        <p><strong>E-mail:</strong> ${opts.email}</p>
        <p><strong>Mensagem:</strong></p>
        <blockquote style="border-left:4px solid #ccc;padding:10px;margin:10px 0;">
          ${opts.message.replace(/\n/g, '<br>')}
        </blockquote>
        <hr>
        <small>Enviado em ${new Date().toLocaleString('pt-BR')}</small>
      `,
    });
  }

  async sendContactConfirmation(opts: ContactEmailOptions): Promise<void> {
    await this.send({
      to: opts.email,
      subject: 'Recebemos sua mensagem — Instituto Job de Brito',
      html: `
        <h2>Olá, ${opts.name}!</h2>
        <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
        <p><strong>Sua mensagem:</strong></p>
        <blockquote style="border-left:4px solid #ccc;padding:10px;margin:10px 0;">
          ${opts.message.replace(/\n/g, '<br>')}
        </blockquote>
        <p>Atenciosamente,<br>
        <strong>Instituto de Educação e Pesquisa Job de Brito</strong></p>
      `,
    });
  }

  // ─── Submission Emails ─────────────────────────────────────────────────────

  async sendSubmissionConfirmation(opts: SubmissionEmailOptions): Promise<void> {
    await this.send({
      to: opts.authorEmail,
      subject: `Submissão recebida — Protocolo ${opts.protocol} | RCBC`,
      html: `
        <h2>Olá, ${opts.authorName}!</h2>
        <p>Sua submissão foi recebida com sucesso pela 
        <strong>Revista Científica Benedito Coscia (RCBC)</strong>.</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Protocolo</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.protocol}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Título</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.title}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Área</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.area}</td>
          </tr>
        </table>
        <p>Guarde este número de protocolo para acompanhar sua submissão.</p>
        <p>Atenciosamente,<br>
        <strong>Equipe Editorial RCBC — Instituto Job de Brito</strong></p>
      `,
    });
  }

  async sendSubmissionNotification(opts: SubmissionEmailOptions): Promise<void> {
    await this.send({
      to: process.env.EMAIL_REVISTA ?? 'revista@institutojob.com.br',
      subject: `[RCBC] Nova submissão: ${opts.protocol}`,
      html: `
        <h2>Nova submissão recebida</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Protocolo</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.protocol}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Autor</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.authorName} (${opts.authorEmail})</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Título</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.title}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Área</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.area}</td>
          </tr>
        </table>
        <p>Acesse o painel administrativo para revisar a submissão.</p>
      `,
    });
  }

  // ─── Status Update Email ───────────────────────────────────────────────────

  async sendStatusUpdate(opts: StatusUpdateEmailOptions): Promise<void> {
    const statusLabels: Record<string, string> = {
      pending: 'Pendente',
      under_review: 'Em revisão',
      accepted: 'Aceito',
      rejected: 'Rejeitado',
      revision: 'Requer revisão',
    };

    const statusLabel = statusLabels[opts.status] ?? opts.status;

    await this.send({
      to: opts.authorEmail,
      subject: `[RCBC] Atualização da submissão ${opts.protocol}`,
      html: `
        <h2>Olá, ${opts.authorName}!</h2>
        <p>O status da sua submissão foi atualizado.</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Protocolo</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.protocol}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Título</td>
            <td style="padding:8px;border:1px solid #ddd;">${opts.title}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Novo Status</td>
            <td style="padding:8px;border:1px solid #ddd;"><strong>${statusLabel}</strong></td>
          </tr>
        </table>
        ${opts.notes ? `<p><strong>Observações da equipe editorial:</strong></p><blockquote style="border-left:4px solid #ccc;padding:10px;">${opts.notes}</blockquote>` : ''}
        <p>Atenciosamente,<br>
        <strong>Equipe Editorial RCBC — Instituto Job de Brito</strong></p>
      `,
    });
  }

  // ─── Private Helper ────────────────────────────────────────────────────────

  private async send(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Instituto Job de Brito" <${process.env.SMTP_USER}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      this.logger.log(`📧 Email sent to ${opts.to}: ${opts.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${opts.to}`, err);
      // Don't throw — email failures shouldn't break the request
    }
  }
}
