import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService, JwtAccessToken } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto): Promise<JwtAccessToken> {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto): Promise<JwtAccessToken> {
    return this.authService.signin(dto);
  }
}