<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Trektoo</title>
</head>
<body style="background-color:#f7f7f7; font-family: Arial, sans-serif; padding: 20px;">

    <div style="max-width: 600px; margin: 0 auto; background:#ffffff; padding: 30px; border-radius: 8px;">
        
        <!-- ✅ Your Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://trektoo.com/_next/image?url=%2Fimages%2Flogo.png&w=256&q=75" alt="Trektoo" style="max-height: 60px;">
        </div>

        <!-- ✅ Email Content -->
        <h2 style="color:#333;">Welcome, {{ $user->name }} 🎉</h2>

        <p style="color:#555; font-size: 16px;">
            Thanks for joining Trektoo! We’re excited to have you on board.
        </p>

        <p style="color:#555; font-size: 16px;">
            You can now start exploring and booking your favorite adventures.
        </p>

        <p style="text-align: center; margin: 30px 0;">
            <a href="{{ url('trektoo.com') }}" style="background:#2d89ef; color:white; padding:12px 20px; border-radius:5px; text-decoration:none;">
                Visit Trektoo
            </a>
        </p>

        <p style="color:#888; font-size: 14px; text-align:center;">
            — The Trektoo Team
        </p>
    </div>

</body>
</html>
