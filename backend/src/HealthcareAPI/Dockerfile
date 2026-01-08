FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/src/HealthcareAPI/HealthcareAPI.csproj ./HealthcareAPI/
RUN dotnet restore ./HealthcareAPI/HealthcareAPI.csproj
COPY backend/src/HealthcareAPI/ ./HealthcareAPI/
WORKDIR /src/HealthcareAPI
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HealthcareAPI.dll"]
