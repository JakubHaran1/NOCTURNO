from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailToken(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk)+str(timestamp)+str(user.is_active)


emailActivationToken = EmailToken()
