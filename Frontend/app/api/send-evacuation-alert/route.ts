import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emails, location, alertDetails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'No email addresses provided' },
        { status: 400 }
      )
    }

    // Email content
    const subject = `🚨 URGENT: EVACUATION ALERT - ${location.city}, ${location.state}`
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #0a0a0a;
              color: #ffffff;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(to bottom, #1a0000, #0a0a0a);
              border: 3px solid #dc2626;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background-color: #dc2626;
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
            }
            .header p {
              margin: 8px 0 0;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.9);
            }
            .content {
              padding: 24px;
            }
            .alert-box {
              background-color: rgba(220, 38, 38, 0.1);
              border: 2px solid #dc2626;
              border-radius: 8px;
              padding: 16px;
              margin: 16px 0;
              text-align: center;
            }
            .alert-box h2 {
              margin: 0;
              font-size: 32px;
              color: #dc2626;
              font-weight: bold;
            }
            .alert-box p {
              margin: 8px 0 0;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #333;
              border-radius: 6px;
              padding: 12px;
              margin: 8px 0;
              background-color: rgba(255, 255, 255, 0.05);
            }
            .detail-label {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
              text-transform: uppercase;
            }
            .detail-value {
              font-size: 12px;
              color: #ffffff;
              font-weight: bold;
            }
            .critical-value {
              color: #dc2626;
            }
            .warning-value {
              color: #f59e0b;
            }
            .instructions {
              background-color: rgba(234, 179, 8, 0.1);
              border: 2px solid #eab308;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
            }
            .instructions h3 {
              margin: 0 0 12px;
              font-size: 16px;
              color: #eab308;
            }
            .instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 8px 0;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.9);
            }
            .footer {
              padding: 16px 24px;
              text-align: center;
              border-top: 1px solid #333;
              background-color: rgba(0, 0, 0, 0.3);
            }
            .footer p {
              margin: 4px 0;
              font-size: 10px;
              color: rgba(255, 255, 255, 0.5);
            }
            .timestamp {
              background-color: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
              padding: 8px;
              margin: 16px 0;
              text-align: center;
              font-size: 11px;
              color: rgba(255, 255, 255, 0.7);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ EVACUATION ALERT ⚠️</h1>
              <p>ROCKGUARD AI - ROCKFALL PREDICTION SYSTEM</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2>EVACUATE IMMEDIATELY</h2>
                <p>AI-predicted rockfall risk detected</p>
              </div>

              <div class="timestamp">
                🕒 ALERT ISSUED: ${new Date().toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}
              </div>

              <h3 style="color: #dc2626; margin: 24px 0 12px; font-size: 14px;">LOCATION DETAILS</h3>
              <div class="detail-row">
                <span class="detail-label">Location</span>
                <span class="detail-value">${location.city}, ${location.state}</span>
              </div>

              <h3 style="color: #dc2626; margin: 24px 0 12px; font-size: 14px;">THREAT ASSESSMENT</h3>
              <div class="detail-row">
                <span class="detail-label">AI Confidence</span>
                <span class="detail-value critical-value">${alertDetails.confidence}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Primary Threat</span>
                <span class="detail-value critical-value">${alertDetails.threat}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Affected Zones</span>
                <span class="detail-value">${alertDetails.affectedZones}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Personnel at Risk</span>
                <span class="detail-value warning-value">${alertDetails.personnelAtRisk}</span>
              </div>

              <div class="instructions">
                <h3>🚨 EVACUATION PROTOCOL</h3>
                <ol>
                  <li><strong>STOP ALL WORK IMMEDIATELY</strong> - Secure equipment and materials</li>
                  <li><strong>MOVE TO SAFE ZONE</strong> - Follow designated evacuation routes</li>
                  <li><strong>REPORT TO ASSEMBLY POINT</strong> - Account for all personnel</li>
                  <li><strong>DO NOT RETURN</strong> - Wait for all-clear from safety coordinator</li>
                  <li><strong>STAY ALERT</strong> - Monitor communications for updates</li>
                </ol>
              </div>

              <div style="background-color: rgba(220, 38, 38, 0.15); border-radius: 6px; padding: 12px; text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.8);">
                  ⚡ This is an automated alert generated by AI analysis.<br/>
                  You will receive updates every 15 seconds until the situation is resolved.
                </p>
              </div>
            </div>

            <div class="footer">
              <p>ROCKGUARD AI v4.2.1 | ROCKFALL PREDICTION SYSTEM</p>
              <p>For emergencies, contact: +1-800-ROCKFALL | emergency@rockguard.ai</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
🚨 EVACUATION ALERT 🚨
ROCKGUARD AI - ROCKFALL PREDICTION SYSTEM

⚠️ EVACUATE IMMEDIATELY ⚠️
AI-predicted rockfall risk detected

LOCATION: ${location.city}, ${location.state}
AI CONFIDENCE: ${alertDetails.confidence}
PRIMARY THREAT: ${alertDetails.threat}
AFFECTED ZONES: ${alertDetails.affectedZones}
PERSONNEL AT RISK: ${alertDetails.personnelAtRisk}

EVACUATION PROTOCOL:
1. STOP ALL WORK IMMEDIATELY - Secure equipment and materials
2. MOVE TO SAFE ZONE - Follow designated evacuation routes
3. REPORT TO ASSEMBLY POINT - Account for all personnel
4. DO NOT RETURN - Wait for all-clear from safety coordinator
5. STAY ALERT - Monitor communications for updates

Alert issued: ${new Date().toLocaleString()}

This is an automated alert. You will receive updates every 15 seconds.
For emergencies: +1-800-ROCKFALL | emergency@rockguard.ai
    `

    // Send emails using Resend
    console.log('=== SENDING EVACUATION ALERT EMAIL ===')
    console.log('To:', emails.join(', '))
    console.log('Subject:', subject)
    console.log('Time:', new Date().toLocaleString())
    console.log('==============================')

    // Send with Resend
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'RockGuard AI <onboarding@resend.dev>',
      to: emails,
      subject: subject,
      html: htmlContent,
      text: textContent,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(error.message || 'Failed to send email')
    }

    console.log('✅ Email sent successfully! ID:', data?.id)

    return NextResponse.json({
      success: true,
      message: `Alert sent to ${emails.length} recipient(s)`,
      timestamp: new Date().toISOString(),
      recipients: emails.length
    })

  } catch (error) {
    console.error('Error sending evacuation alert:', error)
    return NextResponse.json(
      { error: 'Failed to send evacuation alert' },
      { status: 500 }
    )
  }
}
